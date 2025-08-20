import type { Container } from '@tinkoff/dippy';
import { SyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import type {
  ChildAppDiManager,
  ChildAppPreloadManager,
  ChildAppRenderManager,
  ChildAppRequestConfig,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
  ChildAppConfigArgs,
  CHILD_APP_RENDER_PLUGIN,
} from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';

export class RenderManager implements ChildAppRenderManager {
  private readonly preloadManager: ChildAppPreloadManager;
  private readonly diManager: ChildAppDiManager;
  private readonly resolveExternalConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
  private readonly log: ReturnType<typeof LOGGER_TOKEN>;

  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public hooks: {
    mounted: SyncTapableHookInstance<ChildAppConfigArgs>;
    mountFailed: SyncTapableHookInstance<ChildAppConfigArgs>;
  };

  constructor({
    logger,
    preloadManager,
    diManager,
    resolveExternalConfig,
    hookFactory,
    plugins,
  }: {
    logger: typeof LOGGER_TOKEN;
    preloadManager: ChildAppPreloadManager;
    diManager: ChildAppDiManager;
    resolveExternalConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    plugins: (typeof CHILD_APP_RENDER_PLUGIN)[] | null;
  }) {
    this.hookFactory = hookFactory;
    this.hooks = {
      mounted: this.hookFactory.createSync<ChildAppConfigArgs>('childAppMounted'),
      mountFailed: this.hookFactory.createSync<ChildAppConfigArgs>('childAppMountFailed'),
    };
    this.log = logger('child-app:render');
    this.preloadManager = preloadManager;
    this.diManager = diManager;
    this.resolveExternalConfig = resolveExternalConfig;

    plugins?.forEach((plugin) => {
      plugin.apply(this.hooks);
    });
  }

  getChildDi(
    request: ChildAppRequestConfig
  ): [Container | undefined, undefined | Promise<Container | undefined>] {
    const config = this.resolveExternalConfig(request);

    if (!config) {
      throw new Error(`Child app "${request.name}" not found`);
    }

    if (this.preloadManager.isPreloaded(request)) {
      return [this.diManager.getChildDi(config), undefined];
    }

    // for SPA-navigation, if Child App is preloaded first time, it is valid case
    if (!this.preloadManager.isNotPreloadedForSpaNavigation(request)) {
      this.log.warn({
        event: 'not-preloaded',
        message: 'Child-app has been used but not preloaded before React render',
        childApp: request,
      });
    }

    const promiseDi = this.preloadManager.preload(request).then(() => {
      return this.diManager.getChildDi(config);
    });

    return [undefined, promiseDi];
  }

  clear() {}
}
