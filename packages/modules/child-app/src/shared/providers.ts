import type { Provider } from '@tinkoff/dippy';
import { Scope, DI_TOKEN, optional } from '@tinkoff/dippy';
import { commandLineListTokens, COMMAND_LINE_RUNNER_TOKEN, provide } from '@tramvai/core';
import type { ChildAppRequestConfig } from '@tramvai/tokens-child-app';
import {
  CHILD_APP_CONTRACT_MANAGER,
  CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
  CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  HOST_PROVIDED_CONTRACTS,
  CHILD_APP_ERROR_BOUNDARY_TOKEN,
} from '@tramvai/tokens-child-app';
import { CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN } from '@tramvai/tokens-child-app';
import { CHILD_APP_RENDER_MANAGER_TOKEN } from '@tramvai/tokens-child-app';
import { CHILD_APP_RESOLVE_BASE_URL_TOKEN } from '@tramvai/tokens-child-app';
import {
  CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
  CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_LOADER_TOKEN,
  CHILD_APP_PRELOAD_MANAGER_TOKEN,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
  CHILD_APP_SINGLETON_DI_MANAGER_TOKEN,
} from '@tramvai/tokens-child-app';
import type { CacheType } from '@tramvai/tokens-common';
import {
  ACTION_CONDITIONALS,
  CLEAR_CACHE_TOKEN,
  COMBINE_REDUCERS,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  COMPONENT_REGISTRY_TOKEN,
  ENV_MANAGER_TOKEN,
  ENV_USED_TOKEN,
  LOGGER_TOKEN,
  REGISTER_CLEAR_CACHE_TOKEN,
} from '@tramvai/tokens-common';
import { EXTEND_RENDER } from '@tramvai/tokens-render';
import {
  LINK_PREFETCH_MANAGER_TOKEN,
  PAGE_SERVICE_TOKEN,
  ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
  ROUTER_TOKEN,
} from '@tramvai/tokens-router';
import { LIMIT_ACTION_GLOBAL_TIME_RUN } from '@tramvai/tokens-common';
import { SingletonDiManager } from './singletonDi';
import { DiManager } from './di';
import { CommandLineRunner } from './command';
import { ChildAppStore } from './store';
import { extendRender } from './render';
import { initModuleFederation } from './webpack/moduleFederation';
import { ChildAppResolutionConfigManager } from './resolutionConfigManager';
import { pagePreloadProviders } from './pagePreload';

export const sharedProviders: Provider[] = [
  ...pagePreloadProviders,
  provide({
    provide: COMBINE_REDUCERS,
    multi: true,
    useValue: [ChildAppStore],
  }),
  provide({
    provide: commandLineListTokens.init,
    multi: true,
    useValue: () => initModuleFederation(),
  }),
  provide({
    provide: CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
    useClass: ChildAppResolutionConfigManager,
    deps: {
      configs: { token: CHILD_APP_RESOLUTION_CONFIGS_TOKEN, optional: true },
      logger: LOGGER_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.resolvePageDeps,
    multi: true,
    useFactory: ({ resolutionConfigManager }) => {
      return async function fallbackResolutionConfigManagerInit() {
        await resolutionConfigManager.init();
      };
    },
    deps: {
      resolutionConfigManager: CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_RESOLVE_CONFIG_TOKEN,
    useFactory: ({ envManager, logger, rootBaseUrl, resolutionConfigManager }) => {
      const rawEnv = envManager.get('CHILD_APP_DEBUG');
      const log = logger('child-app:resolve-config');
      const debug = new Map<string, string | undefined>();

      rawEnv?.split(';').reduce((acc, entry) => {
        const [name, url] = entry.split('=');

        return acc.set(name, url);
      }, debug);

      return (request) => {
        const { name, tag = debug.has(name) ? 'debug' : 'latest' } = request;
        const req: ChildAppRequestConfig = { name, tag, version: request.version };
        const config = resolutionConfigManager.resolve(req);

        if (!config) {
          log.error({
            event: 'config-not-found',
            message: `Child-app "${name}" with tag "${tag}" has not found`,
            childApp: req,
          });
          return;
        }

        const { version, baseUrl: configBaseUrl, client, server, css, withoutCss } = config;

        const baseUrl = debug.get(name) ?? configBaseUrl ?? rootBaseUrl;

        if (!baseUrl) {
          throw new Error('CHILD_APP_EXTERNAL_URL was not defined');
        }

        return {
          name,
          tag,
          version,
          key: `${name}@${version}`,
          server: {
            entry: `${baseUrl}${name}/${name}_server@${version}.js`,
            ...server,
          },
          client: {
            baseUrl: `${baseUrl}${name}/`,
            entry: `${baseUrl}${name}/${name}_client@${version}.js`,
            stats: `${baseUrl}${name}/${name}_stats@${version}.json`,
            statsLoadable: `${baseUrl}${name}/${name}_stats_loadable@${version}.json`,
            ...client,
          },
          css: withoutCss
            ? undefined
            : {
                entry: `${baseUrl}${name}/${name}@${version}.css`,
                ...css,
              },
        };
      };
    },
    deps: {
      envManager: ENV_MANAGER_TOKEN,
      logger: LOGGER_TOKEN,
      rootBaseUrl: CHILD_APP_RESOLVE_BASE_URL_TOKEN,
      resolutionConfigManager: CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_RESOLVE_BASE_URL_TOKEN,
    useFactory: ({ envManager }) => {
      return envManager.get('CHILD_APP_EXTERNAL_URL');
    },
    deps: {
      envManager: ENV_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_SINGLETON_DI_MANAGER_TOKEN,
    scope: Scope.SINGLETON,
    useClass: SingletonDiManager,
    deps: {
      logger: LOGGER_TOKEN,
      appDi: DI_TOKEN,
      loader: CHILD_APP_LOADER_TOKEN,
      rootDiAccessMode: optional(CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN),
      contractManager: CHILD_APP_CONTRACT_MANAGER,
    },
  }),
  provide({
    provide: CHILD_APP_DI_MANAGER_TOKEN,
    scope: Scope.REQUEST,
    useClass: DiManager,
    deps: {
      appDi: DI_TOKEN,
      loader: CHILD_APP_LOADER_TOKEN,
      singletonDiManager: CHILD_APP_SINGLETON_DI_MANAGER_TOKEN,
      rootDiAccessMode: optional(CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN),
    },
  }),
  provide({
    provide: CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
    useClass: CommandLineRunner,
    deps: {
      logger: LOGGER_TOKEN,
      rootCommandLineRunner: COMMAND_LINE_RUNNER_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
      commandLineExecutionContext: COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.generatePage,
    multi: true,
    useFactory: ({ preloadManager }) => {
      return function childAppPageRender() {
        preloadManager.pageRender();
      };
    },
    deps: {
      preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.clear,
    multi: true,
    useFactory: ({ preloader }) => {
      return function childAppClear() {
        return preloader.clearPreloaded();
      };
    },
    deps: {
      preloader: CHILD_APP_PRELOAD_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: REGISTER_CLEAR_CACHE_TOKEN,
    multi: true,
    scope: Scope.SINGLETON,
    useFactory: ({ diManager }) => {
      return (type?: CacheType) => {
        diManager.forEachChildDi((di) => {
          const clearCache = di.get({ token: CLEAR_CACHE_TOKEN, optional: true });

          if (clearCache) {
            // first if child-app has its own CLEAR_CACHE_TOKEN implementation use only it
            return clearCache(type);
          }
          // otherwise pick up any REGISTER_CLEAR_CACHE_TOKEN hooks and call it
          const registeredClearCache =
            (di.get({
              token: REGISTER_CLEAR_CACHE_TOKEN,
              optional: true,
            }) as any as (typeof REGISTER_CLEAR_CACHE_TOKEN)[]) ?? [];

          return Promise.all(registeredClearCache.map((clear) => clear(type)));
        });
      };
    },
    deps: {
      diManager: CHILD_APP_SINGLETON_DI_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: EXTEND_RENDER,
    multi: true,
    useFactory: extendRender,
    deps: {
      renderManager: CHILD_APP_RENDER_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: ENV_USED_TOKEN,
    multi: true,
    useValue: [
      {
        key: 'CHILD_APP_DEBUG',
        dehydrate: true,
        optional: true,
      },
    ],
  }),
  provide({
    provide: HOST_PROVIDED_CONTRACTS,
    useValue: {
      providedContracts: [
        ROUTER_TOKEN,
        COMPONENT_REGISTRY_TOKEN,
        PAGE_SERVICE_TOKEN,
        LINK_PREFETCH_MANAGER_TOKEN,
        ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
        LIMIT_ACTION_GLOBAL_TIME_RUN,
        // provide host app `ACTION_CONDITIONALS` instances, because they can depend on host app reducers or other dependencies
        ACTION_CONDITIONALS,
      ],
    },
  }),
  provide({
    provide: CHILD_APP_ERROR_BOUNDARY_TOKEN,
    useFactory: ({ logger }) => {
      const log = logger('child-app:render');

      return function logErrorBoundary(error, info, config) {
        log.error({
          event: 'component-did-catch',
          message: 'An unexpected error occured during rendering',
          error,
          info,
          childApp: config,
        });
      };
    },
    deps: {
      logger: LOGGER_TOKEN,
    },
    multi: true,
  }),
];
