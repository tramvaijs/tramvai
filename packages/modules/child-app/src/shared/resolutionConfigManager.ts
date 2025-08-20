import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import flatten from '@tinkoff/utils/array/flatten';
import type {
  ChildAppRequestConfig,
  ChildAppResolutionConfig,
  CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
  CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
  ResolutionConfig,
  CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
} from '@tramvai/tokens-child-app';
import type { ExtractDependencyType, ExtractTokenType } from '@tinkoff/dippy';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { AsyncTapableHookInstance, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';

type Interface = ExtractTokenType<typeof CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN>;

export class ChildAppResolutionConfigManager implements Interface {
  private rawConfigs: ExtractDependencyType<typeof CHILD_APP_RESOLUTION_CONFIGS_TOKEN>;
  private mapping: Map<string, ChildAppResolutionConfig>;
  private log: ReturnType<typeof LOGGER_TOKEN>;
  private hasInitialized = false;
  private initPromise?: Promise<void>;

  private hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;

  public fetchConfigHook: AsyncTapableHookInstance<
    {},
    ExtractDependencyType<typeof CHILD_APP_RESOLUTION_CONFIGS_TOKEN>
  >;

  constructor({
    configs,
    logger,
    hookFactory,
    plugins,
  }: {
    hookFactory: typeof TAPABLE_HOOK_FACTORY_TOKEN;
    plugins: (typeof CHILD_APP_CONFIG_RESOLUTION_PLUGIN)[] | null;
    configs: ExtractDependencyType<typeof CHILD_APP_RESOLUTION_CONFIGS_TOKEN> | null;
    logger: typeof LOGGER_TOKEN;
  }) {
    this.hookFactory = hookFactory;
    this.fetchConfigHook = this.hookFactory.createAsync<
      {},
      ExtractDependencyType<typeof CHILD_APP_RESOLUTION_CONFIGS_TOKEN>
    >('childAppFetchConfig');

    this.rawConfigs = configs ?? [];
    this.mapping = new Map();
    this.log = logger('child-app:resolution-config');

    this.fetchConfigHook.tapPromise('childAppFetchConfig', async () => {
      const result = await this.fetchChildAppConfig();
      return result;
    });

    plugins?.forEach((plugin) => {
      plugin.apply({ fetchConfig: this.fetchConfigHook });
    });
  }

  private async fetchChildAppConfig() {
    const configs = await Promise.all(
      this.rawConfigs.map((rawConfig) => {
        return Promise.resolve()
          .then(() => {
            return applyOrReturn([], rawConfig);
          })
          .catch((error) => {
            this.log.error({
              event: 'config-resolve-failed',
              message: 'Failed while resolving resolution config',
              error,
            });
            return [];
          });
      })
    );
    return configs;
  }

  async init() {
    if (this.hasInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const configs = await this.fetchConfigHook.callPromise({});
      flatten<ChildAppResolutionConfig>(configs).forEach((config) => {
        if (config) {
          this.mapping.set(config.name, config);
        }
      });

      this.hasInitialized = true;
    })();

    return this.initPromise;
  }

  resolve({ name, version, tag = 'latest' }: ChildAppRequestConfig): ResolutionConfig | undefined {
    const fromMapping = this.mapping.get(name);

    if (!fromMapping) {
      return;
    }

    const cfg = fromMapping.byTag[tag];

    if (process.env.NODE_ENV === 'development' && tag === 'debug' && !cfg) {
      return {
        baseUrl: 'http://localhost:4040/',
        version: '0.0.0-stub',
      };
    }

    return {
      ...cfg,
      baseUrl: cfg.baseUrl ?? fromMapping.baseUrl,
      version: version ?? cfg.version,
    };
  }
}
