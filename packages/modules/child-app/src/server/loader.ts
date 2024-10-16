import isNil from '@tinkoff/utils/is/nil';
import type { ChildApp } from '@tramvai/child-app-core';
import { ServerLoader as LowLevelLoader } from '@tinkoff/module-loader-server';
import type { ChildAppFinalConfig } from '@tramvai/tokens-child-app';
import type {
  CREATE_CACHE_TOKEN,
  LOGGER_TOKEN,
  Cache,
  ENV_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
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
  private internalLoadCache: Cache; // used to clear cache for debug
  private log: ReturnType<typeof LOGGER_TOKEN>;
  constructor({
    logger,
    createCache,
    envManager,
  }: {
    logger: typeof LOGGER_TOKEN;
    createCache: typeof CREATE_CACHE_TOKEN;
    envManager: typeof ENV_MANAGER_TOKEN;
  }) {
    super();
    const cache = createCache('memory', {
      name: 'child-app-loader',
      ttl: 1000 * 60 * 60 * 24 * 5,
      max: 20,
    });

    this.internalLoadCache = cache;
    this.log = logger('child-app:loader');
    this.loader = new LowLevelLoader({
      cache,
      log: this.log,
      requestOptions: {
        circuitBreakerEnabled: isNil(envManager.get('HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED')),
      },
    });
  }

  async load(config: ChildAppFinalConfig): Promise<ChildApp | void> {
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
          })
          // we can live without loadable stats, for backward compatibility is ok
          // but hydration errors will occur when lazy component will loaded at client-side at demand
          .catch(() => {})
      );
    }

    await Promise.all(promises);

    await this.init(config);

    if (config.tag === 'debug') {
      setTimeout(() => {
        this.internalLoadCache.set(config.server.entry, null);
      }, 10000);
    }

    return this.get(config);
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
    } catch (err: any) {
      this.log.error(err);
      throw err;
    }
  }

  get(config: ChildAppFinalConfig): ChildApp | void {
    const container = this.loader.getByUrl<ModuleFederationContainer>(config.server.entry);
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
