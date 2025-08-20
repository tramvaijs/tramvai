import type { Provider } from '@tinkoff/dippy';
import { isUrl, endsWith, combineValidators } from '@tinkoff/env-validators';
import { DI_TOKEN, Scope, optional } from '@tinkoff/dippy';
import { commandLineListTokens, provide, TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import {
  ASYNC_LOCAL_STORAGE_TOKEN,
  ENV_MANAGER_TOKEN,
  ENV_USED_TOKEN,
  LOGGER_TOKEN,
  STORE_TOKEN,
} from '@tramvai/tokens-common';
import {
  EXTEND_RENDER,
  RENDER_SLOTS,
  ResourceSlot,
  RESOURCES_REGISTRY,
  ResourceType,
  REACT_SERVER_RENDER_MODE,
  RENDER_FLOW_AFTER_TOKEN,
} from '@tramvai/tokens-render';
import {
  CHILD_APP_CONTRACT_MANAGER,
  CHILD_APP_LOADER_CACHE_TOKEN,
  CHILD_APP_RENDER_MANAGER_TOKEN,
  CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
  CHILD_APP_STATE_MANAGER_TOKEN,
  HOST_PROVIDED_CONTRACTS,
  HOST_REQUIRED_CONTRACTS,
  CHILD_APP_LOADER_PLUGIN,
  CHILD_APP_PRELOAD_MANAGER_PLUGIN,
} from '@tramvai/tokens-child-app';
import {
  CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
  CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_LOADER_TOKEN,
  CHILD_APP_PRELOAD_MANAGER_TOKEN,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import { safeStringify } from '@tramvai/safe-strings';
import { ServerLoader } from './loader';
import { PreloadManager } from './preload';
import { executeRootStateSubscriptions, StateManager } from './stateManager';
import { setPreloaded } from '../shared/store';
import { RenderManager } from './render';
import { registerChildAppRenderSlots } from './render-slots';
import { GLOBAL_CHILD_STATE } from '../shared/constants';
import { ChildAppContractManager } from '../contracts/contractManager.server';
import { cache } from './cache/cache';

export const serverProviders: Provider[] = [
  ...cache,
  provide({
    provide: ENV_USED_TOKEN,
    multi: true,
    useValue: [
      {
        key: 'CHILD_APP_EXTERNAL_URL',
        optional: true,
        validator: combineValidators([isUrl, endsWith('/')]),
      },
    ],
  }),

  provide({
    provide: CHILD_APP_LOADER_TOKEN,
    useClass: ServerLoader,
    scope: Scope.SINGLETON,
    deps: {
      plugins: {
        optional: true,
        token: CHILD_APP_LOADER_PLUGIN,
      },
      hookFactory: TAPABLE_HOOK_FACTORY_TOKEN,
      logger: LOGGER_TOKEN,
      cache: CHILD_APP_LOADER_CACHE_TOKEN,
      envManager: ENV_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_STATE_MANAGER_TOKEN,
    useClass: StateManager,
    deps: {
      logger: LOGGER_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
      resourcesRegistry: RESOURCES_REGISTRY,
    },
  }),
  provide({
    provide: CHILD_APP_PRELOAD_MANAGER_TOKEN,
    useClass: PreloadManager,
    deps: {
      hookFactory: TAPABLE_HOOK_FACTORY_TOKEN,
      plugins: {
        optional: true,
        token: CHILD_APP_PRELOAD_MANAGER_PLUGIN,
      },
      loader: CHILD_APP_LOADER_TOKEN,
      runner: CHILD_APP_COMMAND_LINE_RUNNER_TOKEN,
      stateManager: CHILD_APP_STATE_MANAGER_TOKEN,
      resolutionConfigManager: CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN,
      resolveFullConfig: CHILD_APP_RESOLVE_CONFIG_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: RENDER_SLOTS,
    multi: true,
    useFactory: ({ stateManager, preloader, store }) => {
      store.dispatch(setPreloaded(preloader.getPreloadedList()));

      return {
        type: ResourceType.asIs,
        slot: ResourceSlot.BODY_END,
        payload: `<script id="${GLOBAL_CHILD_STATE}" type="application/json">${safeStringify(
          stateManager.getState()
        )}</script>`,
      };
    },
    deps: {
      stateManager: CHILD_APP_STATE_MANAGER_TOKEN,
      preloader: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      store: STORE_TOKEN,
    },
  }),
  provide({
    provide: RENDER_FLOW_AFTER_TOKEN,
    multi: true,
    useFactory: registerChildAppRenderSlots,
    deps: {
      resourcesRegistry: RESOURCES_REGISTRY,
      logger: LOGGER_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
      resolveFullConfig: CHILD_APP_RESOLVE_CONFIG_TOKEN,
      loader: CHILD_APP_LOADER_TOKEN,
      preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      renderMode: optional(REACT_SERVER_RENDER_MODE),
    },
  }),
  provide({
    provide: EXTEND_RENDER,
    multi: true,
    // execute subscription right before render to get the last actual data
    useFactory: executeRootStateSubscriptions,
    deps: {
      store: STORE_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_RENDER_MANAGER_TOKEN,
    useClass: RenderManager,
    deps: {
      hookFactory: TAPABLE_HOOK_FACTORY_TOKEN,
      logger: LOGGER_TOKEN,
      diManager: CHILD_APP_DI_MANAGER_TOKEN,
      preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      resolveFullConfig: CHILD_APP_RESOLVE_CONFIG_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.resolvePageDeps,
    multi: true,
    useFactory: ({ preloader, logger }) => {
      return function childAppRunPreloaded() {
        return preloader.runPreloaded().catch((error) => {
          const log = logger('child-app:run-preloaded');

          log.error({
            event: 'server-failed',
            error,
          });
        });
      };
    },
    deps: {
      preloader: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      logger: LOGGER_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.clear,
    multi: true,
    useFactory: ({ renderManager }) => {
      return function childAppRenderClear() {
        renderManager.clear();
      };
    },
    deps: {
      renderManager: CHILD_APP_RENDER_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_CONTRACT_MANAGER,
    scope: Scope.SINGLETON,
    useFactory: (deps) => new ChildAppContractManager(deps),
    deps: {
      appDi: DI_TOKEN,
      asyncLocalStorage: ASYNC_LOCAL_STORAGE_TOKEN,
      hostProvidedContracts: optional(HOST_PROVIDED_CONTRACTS),
      hostRequiredContracts: optional(HOST_REQUIRED_CONTRACTS),
      logger: LOGGER_TOKEN,
    },
  }),
];
