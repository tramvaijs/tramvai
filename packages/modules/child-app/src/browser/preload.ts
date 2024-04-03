import {
  type ChildAppCommandLineRunner,
  type ChildAppRequestConfig,
  type ChildAppLoader,
  type ChildAppPreloadManager,
  type CHILD_APP_RESOLVE_CONFIG_TOKEN,
  type ChildAppFinalConfig,
  type CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
  type CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
} from '@tramvai/tokens-child-app';
import type { STORE_TOKEN } from '@tramvai/tokens-common';
import { optional } from '@tinkoff/dippy';
import type { Route } from '@tinkoff/router';
import { ChildAppStore } from '../shared/store';

export class PreloadManager implements ChildAppPreloadManager {
  private loader: ChildAppLoader;
  private runner: ChildAppCommandLineRunner;
  private store: typeof STORE_TOKEN;
  private resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
  private resolveExternalConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
  private diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;

  private pageHasRendered = false;
  private pageHasLoaded = false;
  private currentlyPreloaded = new Map<string, ChildAppFinalConfig>();
  private hasPreloadBefore = new Set<string>();
  private hasInitialized = false;
  private map = new Map<string, Promise<void>>();

  constructor({
    loader,
    runner,
    resolutionConfigManager,
    resolveExternalConfig,
    store,
    diManager,
  }: {
    loader: ChildAppLoader;
    runner: ChildAppCommandLineRunner;
    resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
    resolveExternalConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
    store: typeof STORE_TOKEN;
    diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
  }) {
    this.loader = loader;
    this.runner = runner;
    this.store = store;
    this.resolutionConfigManager = resolutionConfigManager;
    this.resolveExternalConfig = resolveExternalConfig;
    this.diManager = diManager;
  }

  async preload(
    request: ChildAppRequestConfig,
    route?: Route,
    onlyPrefetch = false
  ): Promise<void> {
    await this.init();

    const config = this.resolveExternalConfig(request);

    if (!config) {
      return;
    }

    const { key } = config;

    if (this.pageHasRendered) {
      this.currentlyPreloaded.set(key, config);
    }

    if (!this.isPreloaded(config)) {
      if (this.map.has(key)) {
        return this.map.get(key);
      }
      // TODO: remove after dropping support for react@<18 as it can handle hydration errors with Suspense
      // in case React render yet has not been executed do not load any external child-app app as
      // as it will lead to markup mismatch on markup hydration
      if (this.pageHasRendered) {
        // but in case render has happened load child-app as soon as possible
        const promise = (async () => {
          try {
            await this.loader.load(config);
            await this.resolveComponent(config, route);

            if (!onlyPrefetch) {
              await this.run('customer', config);
              await this.run('clear', config);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Child App loading error', error);
            }
          }

          this.hasPreloadBefore.add(key);
        })();

        this.map.set(key, promise);

        return promise;
      }
    } else {
      // case for SPA-navigation to another page of same Child App without prefetch
      await this.resolveComponent(config, route);
    }
  }

  async prefetch(request: ChildAppRequestConfig, route?: Route): Promise<void> {
    return this.preload(request, route, true);
  }

  isPreloaded(request: ChildAppRequestConfig): boolean {
    const config = this.resolveExternalConfig(request);

    return !!config && this.hasPreloadBefore.has(config.key);
  }

  async runPreloaded() {
    await this.init();

    if (this.pageHasRendered) {
      return;
    }

    const promises: Promise<void>[] = [];

    this.currentlyPreloaded.forEach((config) => {
      promises.push(
        (async () => {
          await this.loader.init(config);
          // case for client initialization of Child App
          await this.resolveComponent(config);
          await this.run('customer', config);
        })()
      );
    });

    await Promise.all(promises);
  }

  pageRender(): void {
    this.pageHasRendered = true;
  }

  async clearPreloaded(): Promise<void> {
    if (this.pageHasLoaded) {
      this.currentlyPreloaded.clear();
      this.map.clear();
      return;
    }

    this.pageHasLoaded = true;

    const promises: Promise<void>[] = [];

    this.currentlyPreloaded.forEach((config) => {
      promises.push(this.run('clear', config));
    });

    this.currentlyPreloaded.clear();
    this.map.clear();

    await Promise.all(promises);
  }

  getPreloadedList(): ChildAppFinalConfig[] {
    return Array.from(this.currentlyPreloaded.values());
  }

  private initServerPreloaded() {
    if (!this.hasInitialized) {
      const { preloaded } = this.store.getState(ChildAppStore);

      preloaded.forEach((request) => {
        const config = this.resolveExternalConfig(request);

        if (config) {
          this.currentlyPreloaded.set(config.key, config);
          this.hasPreloadBefore.add(config.key);
        }
      });

      this.hasInitialized = true;
    }
  }

  private async init() {
    await this.resolutionConfigManager.init();
    this.initServerPreloaded();
  }

  private async run(status: string, config: ChildAppFinalConfig) {
    const childApp = this.loader.get(config);

    if (!childApp) {
      return;
    }

    await this.runner.run('client', status, config);
  }

  // preload child app page component - we need to register page actions before running all child app actions
  private async resolveComponent(config: ChildAppFinalConfig, route?: Route) {
    const di = this.diManager.getChildDi(config);
    const childAppPageService = di?.get(optional(CHILD_APP_PAGE_SERVICE_TOKEN));

    if (childAppPageService) {
      await childAppPageService.resolveComponent(route);
    }
  }
}
