import { optional } from '@tinkoff/dippy';
import type { Route } from '@tinkoff/router';
import { AsyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
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
  CHILD_APP_PRELOAD_MANAGER_PLUGIN,
  PreloadArgs,
  RunChildAppCommandLineArgs,
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

  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public hooks: {
    preloadChildApp: AsyncTapableHookInstance<PreloadArgs>;
    prefetchChildApp: AsyncTapableHookInstance<PreloadArgs>;
    runChildAppCommandLine: AsyncTapableHookInstance<RunChildAppCommandLineArgs>;
  };

  constructor({
    loader,
    runner,
    stateManager,
    resolutionConfigManager,
    resolveFullConfig,
    diManager,
    hookFactory,
    plugins,
  }: {
    loader: ChildAppLoader;
    runner: ChildAppCommandLineRunner;
    stateManager: ChildAppStateManager;
    resolutionConfigManager: typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN;
    resolveFullConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
    diManager: typeof CHILD_APP_DI_MANAGER_TOKEN;
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    plugins: (typeof CHILD_APP_PRELOAD_MANAGER_PLUGIN)[] | null;
  }) {
    this.loader = loader;
    this.runner = runner;
    this.stateManager = stateManager;
    this.resolutionConfigManager = resolutionConfigManager;
    this.resolveFullConfig = resolveFullConfig;
    this.diManager = diManager;
    this.hookFactory = hookFactory;

    this.hooks = {
      preloadChildApp: this.hookFactory.createAsync<PreloadArgs>('preloadChildApp'),
      prefetchChildApp: this.hookFactory.createAsync<PreloadArgs>('prefetchChildApp'),
      runChildAppCommandLine:
        this.hookFactory.createAsync<RunChildAppCommandLineArgs>('runChildAppCommandLine'),
    };

    this.hooks.preloadChildApp.tapPromise('childAppPreload', async (_, payload) => {
      await this.preloadChildAppHook(payload);
    });
    this.hooks.prefetchChildApp.tapPromise('childAppPrefetch', async () => {
      // do nothing at server side
    });

    this.hooks.runChildAppCommandLine.tapPromise('childAppCommandRun', async (_, payload) => {
      await this.runChildAppCommandLineHook(payload);
    });
    plugins?.forEach((plugin) => {
      plugin.apply(this.hooks);
    });
  }

  private async runChildAppCommandLineHook({
    config,
    status,
  }: {
    config: ChildAppFinalConfig;
    status: string;
  }) {
    const childApp = this.loader.get(config);

    if (!childApp) {
      return;
    }

    await this.runner.run('server', status, config);
    await this.stateManager.registerChildApp(config);
  }

  private async preloadChildAppHook({ config }: { config: ChildAppFinalConfig }) {
    const { key } = config;
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

  async preload(request: ChildAppRequestConfig, route?: Route): Promise<void> {
    await this.resolutionConfigManager.init();
    const config = this.resolveFullConfig(request);

    if (!config) {
      return;
    }

    const { key } = config;

    if (this.map.has(key)) {
      await this.map.get(key);
    }

    await this.hooks.preloadChildApp.callPromise({
      config,
      route,
    });
  }

  async prefetch(request: ChildAppRequestConfig, route?: Route): Promise<void> {
    // do nothing on server side
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
    await this.hooks.runChildAppCommandLine.callPromise({
      config,
      status,
      line: 'server',
    });
  }

  saveNotPreloadedForSpaNavigation(request: ChildAppRequestConfig): void {
    // do nothing at server-side
  }

  isNotPreloadedForSpaNavigation(request: ChildAppRequestConfig): boolean {
    // do nothing at server-side
    return false;
  }
}
