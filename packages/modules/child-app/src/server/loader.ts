import isNil from '@tinkoff/utils/is/nil';
import type { CHILD_APP_LOADER_PLUGIN, ChildApp } from '@tramvai/child-app-core';
import { ServerLoader as LowLevelLoader } from '@tinkoff/module-loader-server';
import {
  CHILD_APP_LOADER_CACHE_OPTIONS_TOKEN,
  type ChildAppFinalConfig,
} from '@tramvai/tokens-child-app';
import type {
  CREATE_CACHE_TOKEN,
  LOGGER_TOKEN,
  Cache,
  ENV_MANAGER_TOKEN,
  ASYNC_LOCAL_STORAGE_TOKEN,
} from '@tramvai/tokens-common';
import { AsyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import { Loader } from '../shared/loader';
import type {
  LoadableStats,
  ModuleFederationContainer,
  ModuleFederationStats,
} from '../shared/webpack/moduleFederation';
import { initModuleFederation } from '../shared/webpack/moduleFederation';
import { getModuleFederation } from '../shared/webpack/moduleFederation';
import type { ChildAppModuleWrapper } from '../shared/types/module';

export class ServerLoader extends Loader {
  private readonly loader: LowLevelLoader;
  private readonly initializedMap = new WeakMap<ModuleFederationContainer, ChildAppModuleWrapper>();
  private log: ReturnType<typeof LOGGER_TOKEN>;

  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public loadModuleHook: AsyncTapableHookInstance<
    { config: ChildAppFinalConfig },
    ChildApp | undefined
  >;

  constructor({
    logger,
    createCache,
    envManager,
    cacheOptions,
    asyncLocalStorage,
    hookFactory,
    plugins,
  }: {
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    logger: typeof LOGGER_TOKEN;
    createCache: typeof CREATE_CACHE_TOKEN;
    envManager: typeof ENV_MANAGER_TOKEN;
    cacheOptions: typeof CHILD_APP_LOADER_CACHE_OPTIONS_TOKEN | null;
    asyncLocalStorage: typeof ASYNC_LOCAL_STORAGE_TOKEN | null;
    plugins: (typeof CHILD_APP_LOADER_PLUGIN)[] | null;
  }) {
    super();
    this.hookFactory = hookFactory;
    const cache = createCache('memory', {
      name: 'child-app-loader',
      ttl: 1000 * 60 * 60 * 24 * 5,
      // When Child App script is evicted from server loader cache, we get a small memory leak,
      // because providers in singleton child DI, page components / actions, will store a reference to removed script,
      // and server loader cache will contain a new instance of the same script.
      //
      // So, it is better to have bigger cache size to prevent evicting from cache,
      // also for one Child App we need to save 3 elements - server JS, stats JSON and loadable stats JSON.
      //
      // TODO: cache cleanup for previous versions of Child Apps
      max: 100,
      ...cacheOptions,
    });
    let internalLoadCache = cache;
    // Cache is not compatible with HMR (Hot Module Replacement) because after HMR and page reload,
    // we get the page from the cache. To solve this, we use Async Local Storage to ensure the
    // cache is only valid within the context of a single request.
    if (process.env.NODE_ENV === 'development' && !!asyncLocalStorage) {
      internalLoadCache = {
        get(key: string) {
          if (key?.startsWith('__DEBUG__')) {
            const store = asyncLocalStorage.getStore() as { [key: string]: any } | undefined;
            if (store) {
              return store[key];
            }
          } else {
            return cache.get(key);
          }
        },
        set(key: string, module: any) {
          if (key?.startsWith('__DEBUG__')) {
            const store = asyncLocalStorage.getStore() as { [key: string]: any } | undefined;
            if (store) {
              store[key] = module;
            }
          } else {
            cache.set(key, module);
          }
        },
      } as Cache;
    }

    this.log = logger('child-app:loader');
    this.loader = new LowLevelLoader({
      cache: internalLoadCache,
      log: this.log,
      requestOptions: {
        circuitBreakerEnabled: isNil(envManager.get('HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED')),
      },
    });

    this.loadModuleHook = this.hookFactory.createAsync<
      { config: ChildAppFinalConfig },
      ChildApp | undefined
    >('childAppLoadModule');

    this.loadModuleHook.tapPromise('childAppLoadModule', async (_, payload) => {
      return this.loadModule(payload);
    });

    plugins?.forEach((plugin) => {
      plugin.apply({ loadModule: this.loadModuleHook });
    });
  }

  private async loadModule({ config }: { config: ChildAppFinalConfig }) {
    const promises = [
      this.loader.resolveByUrl<ModuleFederationContainer>(config.server.entry, {
        codePrefix: `var ASSETS_PREFIX="${config.client.baseUrl}";`,
        displayName: config.name,
        kind: 'child-app',
      }),
      this.loader
        .resolveByUrl(config.client.stats, {
          type: 'json',
          kind: 'child-app stats',
          displayName: config.name,
          silent: true,
        })
        // we can live without stats
        .catch(() => {}),
    ];

    if (config.client.statsLoadable) {
      promises.push(
        this.loader
          .resolveByUrl(config.client.statsLoadable, {
            type: 'json',
            kind: 'child-app loadable stats',
            displayName: config.name,
            silent: true,
          })
          // we can live without loadable stats, for backward compatibility is ok
          // but hydration errors will occur when lazy component will loaded at client-side at demand
          .catch(() => {})
      );
    }

    await Promise.all(promises);

    await this.init(config);

    return this.get(config);
  }

  async load(config: ChildAppFinalConfig): Promise<ChildApp | void> {
    const childApp = await this.loadModuleHook.callPromise({ config });
    return childApp;
  }

  async init(config: ChildAppFinalConfig): Promise<void> {
    const container = this.loader.getByUrl<ModuleFederationContainer>(config.server.entry);

    if (!container) {
      return;
    }

    try {
      await initModuleFederation(container, 'default');

      // copy some logic from https://github.com/module-federation/universe/blob/02221527aa684d2a37773c913bf341748fd34ecf/packages/node/src/plugins/loadScript.ts#L66
      // to implement the same logic for loading child-app as UniversalModuleFederation
      global.__remote_scope__._config[config.name] = config.server.entry;

      const factory = (await getModuleFederation(
        container,
        'entry'
      )) as () => ChildAppModuleWrapper;
      const entry = factory();

      this.initializedMap.set(container, entry);
    } catch (error: any) {
      this.log.error({
        event: 'init-mf-failed',
        error,
        childApp: { name: config.name, version: config.version, tag: config.tag },
      });

      throw error;
    }
  }

  get(config: ChildAppFinalConfig): ChildApp | undefined {
    const container = this.loader.getByUrl<ModuleFederationContainer>(config.server.entry);

    if (!container) {
      return undefined;
    }

    const entry = container && this.initializedMap.get(container);

    return entry && this.resolve(entry);
  }

  getStats(config: ChildAppFinalConfig): ModuleFederationStats | void {
    return this.loader.getByUrl<ModuleFederationStats>(config.client.stats);
  }

  getLoadableStats(config: ChildAppFinalConfig): LoadableStats | void {
    if (!config.client.statsLoadable) {
      return;
    }
    return this.loader.getByUrl<LoadableStats>(config.client.statsLoadable);
  }

  async waitFor() {
    throw Error('Method "waitFor" is not implemented for server loader');
  }
}
