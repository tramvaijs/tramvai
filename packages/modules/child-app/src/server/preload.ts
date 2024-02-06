import { optional } from '@tinkoff/dippy';
import type { Route } from '@tinkoff/router';
import {
  type ChildAppCommandLineRunner,
  type ChildAppRequestConfig,
  type ChildAppLoader,
  type ChildAppPreloadManager,
  type ChildAppStateManager,
  type CHILD_APP_RESOLVE_CONFIG_TOKEN,
  type ChildAppFinalConfig,
  type CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
  type CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
} from '@tramvai/tokens-child-app';

export class PreloadManager implements ChildAppPreloadManager {
  private loader: ChildAppLoader;
  private runner: ChildAppCommandLineRunner;
  private stateManager: ChildAppStateManager;
  private resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
  private readonly resolveFullConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
  private diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;

  private shouldRunImmediately = false;
  private map = new Map<string, Promise<ChildAppFinalConfig>>();
  private preloadMap = new Map<string, ChildAppFinalConfig>();

  constructor({
    loader,
    runner,
    stateManager,
    resolutionConfigManager,
    resolveFullConfig,
    diManager,
  }: {
    loader: ChildAppLoader;
    runner: ChildAppCommandLineRunner;
    stateManager: ChildAppStateManager;
    resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
    resolveFullConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
    diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
  }) {
    this.loader = loader;
    this.runner = runner;
    this.stateManager = stateManager;
    this.resolutionConfigManager = resolutionConfigManager;
    this.resolveFullConfig = resolveFullConfig;
    this.diManager = diManager;
  }

  async preload(request: ChildAppRequestConfig, route?: Route): Promise<void> {
    await this.resolutionConfigManager.init();

    const config = this.resolveFullConfig(request);

    if (!config) {
      return;
    }

    const { key } = config;

    if (this.map.has(key)) {
      await this.map.get(key);
      return;
    }

    const promise = this.loader
      .load(config)
      .catch(() => {
        // Actual error will be logged by the internals of this.loader
      })
      .then(async () => {
        // preload child app page component - we need to register page actions before running all child app actions
        const di = this.diManager.getChildDi(config);
        const childAppPageService = di?.get(optional(CHILD_APP_PAGE_SERVICE_TOKEN));

        if (childAppPageService) {
          await childAppPageService.resolveComponent();
        }

        if (this.shouldRunImmediately) {
          return this.run('customer', config);
        }
      })
      .then(() => config);

    this.map.set(key, promise);
    this.preloadMap.set(config.key, config);

    if (this.shouldRunImmediately) {
      await promise;
    }
  }

  async prefetch(request: ChildAppRequestConfig, route?: Route): Promise<void> {
    return this.preload(request, route);
  }

  isPreloaded(request: ChildAppRequestConfig): boolean {
    const config = this.resolveFullConfig(request);

    return !!config && this.map.has(config.key);
  }

  async runPreloaded() {
    this.shouldRunImmediately = true;
    const promises: Promise<void>[] = [];
    this.map.forEach((childAppPromise) => {
      promises.push(
        (async () => {
          await this.run('customer', await childAppPromise);
        })()
      );
    });

    await Promise.all(promises);
  }

  pageRender(): void {}

  async clearPreloaded(): Promise<void> {
    const promises: Promise<void>[] = [];
    this.map.forEach((childAppPromise) => {
      promises.push(
        (async () => {
          await this.run('clear', await childAppPromise);
        })()
      );
    });

    await Promise.all(promises);
  }

  getPreloadedList(): ChildAppFinalConfig[] {
    return Array.from(this.preloadMap.values());
  }

  private async run(status: string, config: ChildAppFinalConfig) {
    const childApp = this.loader.get(config);

    if (!childApp) {
      return;
    }

    await this.runner.run('server', status, config);
    await this.stateManager.registerChildApp(config);
  }
}
