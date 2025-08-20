import isNil from '@tinkoff/utils/is/nil';
import type { CHILD_APP_LOADER_PLUGIN, ChildApp } from '@tramvai/child-app-core';
import { ServerLoader as LowLevelLoader } from '@tinkoff/module-loader-server';
import { CHILD_APP_LOADER_CACHE_TOKEN, type ChildAppFinalConfig } from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN, ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
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
    envManager,
    cache,
    hookFactory,
    plugins,
  }: {
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    logger: typeof LOGGER_TOKEN;
    envManager: typeof ENV_MANAGER_TOKEN;
    cache: typeof CHILD_APP_LOADER_CACHE_TOKEN;
    plugins: (typeof CHILD_APP_LOADER_PLUGIN)[] | null;
  }) {
    super();
    this.hookFactory = hookFactory;
    this.log = logger('child-app:loader');
    this.loader = new LowLevelLoader({
      cache,
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
        debug: config.tag === 'debug',
      }),
      this.loader
        .resolveByUrl(config.client.stats, {
          type: 'json',
          kind: 'child-app stats',
          displayName: config.name,
          silent: true,
          debug: config.tag === 'debug',
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
            debug: config.tag === 'debug',
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
    const container = this.loader.getByUrl<ModuleFederationContainer>(config.server.entry, {
      debug: config.tag === 'debug',
    });

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
    const container = this.loader.getByUrl<ModuleFederationContainer>(config.server.entry, {
      debug: config.tag === 'debug',
    });

    if (!container) {
      return undefined;
    }

    const entry = container && this.initializedMap.get(container);

    return entry && this.resolve(entry);
  }

  getStats(config: ChildAppFinalConfig): ModuleFederationStats | void {
    return this.loader.getByUrl<ModuleFederationStats>(config.client.stats, {
      debug: config.tag === 'debug',
    });
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
