import type { Container } from '@tinkoff/dippy';
import { SyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import type {
  ChildAppDiManager,
  ChildAppPreloadManager,
  ChildAppRenderManager,
  ChildAppRequestConfig,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
  ChildAppConfigArgs,
} from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';

export class RenderManager implements ChildAppRenderManager {
  private readonly preloadManager: ChildAppPreloadManager;
  private readonly diManager: ChildAppDiManager;
  private readonly resolveFullConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
  private readonly log: ReturnType<typeof LOGGER_TOKEN>;
  private readonly hasRenderedSet = new Set<string>();
  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public hooks: {
    mounted: SyncTapableHookInstance<ChildAppConfigArgs>;
    mountFailed: SyncTapableHookInstance<ChildAppConfigArgs>;
  };

  constructor({
    logger,
    preloadManager,
    diManager,
    resolveFullConfig,
    hookFactory,
  }: {
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    logger: typeof LOGGER_TOKEN;
    preloadManager: ChildAppPreloadManager;
    diManager: ChildAppDiManager;
    resolveFullConfig: typeof CHILD_APP_RESOLVE_CONFIG_TOKEN;
  }) {
    this.hookFactory = hookFactory;
    this.hooks = {
      mounted: this.hookFactory.createSync<ChildAppConfigArgs>('childAppMounted'),
      mountFailed: this.hookFactory.createSync<ChildAppConfigArgs>('childAppMountFailed'),
    };

    this.log = logger('child-app:render');
    this.preloadManager = preloadManager;
    this.diManager = diManager;
    this.resolveFullConfig = resolveFullConfig;
  }

  getChildDi(
    request: ChildAppRequestConfig
  ): [Container | undefined, undefined | Promise<Container | undefined>] {
    const config = this.resolveFullConfig(request);

    if (!config) {
      throw new Error(`Child app "${request.name}" not found`);
    }

    this.hasRenderedSet.add(config.key);

    if (this.preloadManager.isPreloaded(request)) {
      return [this.diManager.getChildDi(config), undefined];
    }

    this.log.warn({
      event: 'not-preloaded',
      message: 'Child-app has been used but not preloaded before React render',
      childApp: request,
    });

    return [undefined, undefined];
  }

  clear() {
    const preloadedList = this.preloadManager.getPreloadedList();

    for (const request of preloadedList) {
      const config = this.resolveFullConfig(request);

      if (!config || !this.hasRenderedSet.has(config.key)) {
        this.log.warn({
          message: 'Child-app has been preloaded but not used in React render',
          request,
        });
      }
    }

    this.hasRenderedSet.clear();
  }
}
