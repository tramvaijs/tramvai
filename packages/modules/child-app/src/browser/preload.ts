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
  PreloadArgs,
  RunChildAppCommandLineArgs,
  CHILD_APP_PRELOAD_MANAGER_PLUGIN,
} from '@tramvai/tokens-child-app';
import type { STORE_TOKEN } from '@tramvai/tokens-common';
import { optional } from '@tinkoff/dippy';
import type { Route } from '@tinkoff/router';
import { AsyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import { ChildAppStore } from '../shared/store';
import { getModuleFromGlobal } from './loader';
import { setChildAppPreloadStatusOnClient } from '../shared/store';

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
  private notPreloadedForCurrentSpaNavigation = new Set<string>();
  private hasInitialized = false;
  private map = new Map<string, Promise<void>>();

  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public hooks: {
    preloadChildApp: AsyncTapableHookInstance<PreloadArgs>;
    prefetchChildApp: AsyncTapableHookInstance<PreloadArgs>;
    runChildAppCommandLine: AsyncTapableHookInstance<RunChildAppCommandLineArgs>;
  };

  constructor({
    loader,
    runner,
    resolutionConfigManager,
    resolveExternalConfig,
    store,
    diManager,
    hookFactory,
    plugins,
  }: {
    loader: ChildAppLoader;
    runner: ChildAppCommandLineRunner;
    resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
    resolveExternalConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
    store: typeof STORE_TOKEN;
    diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    plugins: (typeof CHILD_APP_PRELOAD_MANAGER_PLUGIN)[] | null;
  }) {
    this.loader = loader;
    this.runner = runner;
    this.store = store;
    this.resolutionConfigManager = resolutionConfigManager;
    this.resolveExternalConfig = resolveExternalConfig;
    this.diManager = diManager;
    this.hookFactory = hookFactory;
    this.hooks = {
      preloadChildApp: this.hookFactory.createAsync<PreloadArgs>('preloadChildApp'),
      prefetchChildApp: this.hookFactory.createAsync<PreloadArgs>('prefetchChildApp'),
      runChildAppCommandLine:
        this.hookFactory.createAsync<RunChildAppCommandLineArgs>('runChildAppCommandLine'),
    };

    this.hooks.prefetchChildApp.tapPromise('prefetchChildApp', async (_, payload) => {
      await this.prefetchChildAppHook(payload);
    });

    this.hooks.preloadChildApp.tapPromise('preloadChildApp', async (_, payload) => {
      await this.preloadChildAppHook(payload);
    });

    this.hooks.runChildAppCommandLine.tapPromise('runChildAppCommandLine', async (_, payload) => {
      await this.runChildAppCommandLineHook(payload);
    });

    plugins?.forEach((plugin) => {
      plugin.apply(this.hooks);
    });
  }

  private async runChildAppCommandLineHook({
    status,
    config,
  }: {
    status: string;
    config: ChildAppFinalConfig;
  }) {
    const childApp = this.loader.get(config);

    if (!childApp) {
      return;
    }

    await this.runner.run('client', status, config);
  }

  private async prefetchChildAppHook({
    config,
    route,
  }: {
    config: ChildAppFinalConfig;
    route: Route | undefined;
  }) {
    await this.loader.load(config);
    await this.resolveComponent(config, route);
  }

  private async preloadChildAppHook({
    config,
    route,
  }: {
    config: ChildAppFinalConfig;
    route: Route | undefined;
  }) {
    await this.loader.load(config);
    await this.resolveComponent(config, route);

    await this.run('customer', config);

    // do not block Child App preloading by "clear" stage (where actions executed),
    // because in will delay Child App rendering
    // TODO: do we need to wait this Child App stage in "afterSpaTransition"?
    // TODO: Can be a race condition between Child App render and actions?
    this.run('clear', config).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Child App command line error', error);
      }
    });
    this.hasPreloadBefore.add(config.key);
  }

  async preload(request: ChildAppRequestConfig, route?: Route): Promise<void> {
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
            await this.hooks.preloadChildApp.callPromise({
              config,
              route,
            });
            this.store.dispatch(
              setChildAppPreloadStatusOnClient({
                [key]: {
                  status: 'loaded',
                },
              })
            );
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.error('Child App loading error', error);
            }
            this.hasPreloadBefore.delete(config.key);
            this.map.delete(config.key);
            this.store.dispatch(
              setChildAppPreloadStatusOnClient({
                [key]: {
                  status: 'error',
                },
              })
            );
            return Promise.reject(error);
          }
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
    await this.init();

    const config = this.resolveExternalConfig(request);

    if (!config) {
      return;
    }

    if (!this.isPreloaded(config)) {
      try {
        await this.hooks.prefetchChildApp.callPromise({ config, route });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Child App prefetch error', error);
        }
        return Promise.reject(error);
      }
    }
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
          // double check that preloaded Child App entry chunk is already loaded on the client.
          // in streaming mode with async scripts it may not be loaded yet, and we need to wait this script.
          // we don't need to load this script, because for server preloaded Child Apps it already been in HTML,
          // for not preloaded Child Apps we don't want to delay hydration
          if (!getModuleFromGlobal(config.client.entry)) {
            // TODO: current test cases work with `loader.load`, need to be sure that new `loader.waitFor` method is necessary
            await this.loader.waitFor(config).catch((e) => {
              // it is expected case if entry chunk is not existed or failed
            });
          }
          // if entry chunk is already loaded, here other Child App chunks will be waited or loaded
          await this.loader.init(config);
          // case for client initialization of Child App
          await this.resolveComponent(config);
          await this.run('customer', config);
        })()
      );
    });

    await Promise.allSettled(promises);
  }

  pageRender(): void {
    this.pageHasRendered = true;
  }

  async clearPreloaded(): Promise<void> {
    if (this.pageHasLoaded) {
      this.currentlyPreloaded.clear();
      this.notPreloadedForCurrentSpaNavigation.clear();
      this.map.clear();
      return;
    }

    this.pageHasLoaded = true;

    const promises: Promise<void>[] = [];

    this.currentlyPreloaded.forEach((config) => {
      promises.push(this.run('clear', config));
    });

    this.currentlyPreloaded.clear();
    this.notPreloadedForCurrentSpaNavigation.clear();
    this.map.clear();

    await Promise.all(promises);
  }

  getPreloadedList(): ChildAppFinalConfig[] {
    return Array.from(this.currentlyPreloaded.values());
  }

  saveNotPreloadedForSpaNavigation(request: ChildAppRequestConfig): void {
    const config = this.resolveExternalConfig(request);

    if (!config) {
      return;
    }

    this.notPreloadedForCurrentSpaNavigation.add(config.key);
  }

  isNotPreloadedForSpaNavigation(request: ChildAppRequestConfig): boolean {
    const config = this.resolveExternalConfig(request);

    if (!config) {
      return false;
    }

    return this.notPreloadedForCurrentSpaNavigation.has(config.key);
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
    await this.initServerPreloaded();
  }

  private async run(status: string, config: ChildAppFinalConfig) {
    await this.hooks.runChildAppCommandLine.callPromise({
      config,
      status,
      line: 'client',
    });
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
