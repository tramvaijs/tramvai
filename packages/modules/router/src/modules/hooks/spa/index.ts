import noop from '@tinkoff/utils/function/noop';
import type { Provider } from '@tramvai/core';
import { DI_TOKEN, COMMAND_LINE_RUNNER_TOKEN, commandLineListTokens } from '@tramvai/core';
import { ROUTER_TOKEN, ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN } from '@tramvai/tokens-router';
import {
  ACTION_REGISTRY_TOKEN,
  ACTION_PAGE_RUNNER_TOKEN,
  STORE_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
  ACTION_EXECUTION_TOKEN,
} from '@tramvai/tokens-common';
import { afterNavigateHooksToken, beforeNavigateHooksToken } from '../../tokens';
import { runCommandsAfterSpa, runCommandsSpa } from './runCommands';
import { resetDeferredActions, runActionsFactory } from '../runActions';

export const spaHooks: Provider[] = [
  {
    provide: beforeNavigateHooksToken,
    multi: true,
    useFactory: runCommandsSpa,
    deps: {
      di: DI_TOKEN,
      commandLineRunner: COMMAND_LINE_RUNNER_TOKEN,
    },
  },
  {
    provide: afterNavigateHooksToken,
    multi: true,
    useFactory: runCommandsAfterSpa,
    deps: {
      di: DI_TOKEN,
      commandLineRunner: COMMAND_LINE_RUNNER_TOKEN,
    },
  },
  {
    provide: commandLineListTokens.spaTransition,
    multi: true,
    useFactory: ({ spaMode, ...deps }: any) => {
      return () => {
        // we need to reset dynamic deferred actions promises befor page render with updated route,
        // defered promise will be fresh and fallback will be shown
        resetDeferredActions(deps);

        if (spaMode !== 'after') {
          return runActionsFactory(deps)();
        }
      };
    },
    deps: {
      store: STORE_TOKEN,
      router: ROUTER_TOKEN,
      actionRegistry: ACTION_REGISTRY_TOKEN,
      actionPageRunner: ACTION_PAGE_RUNNER_TOKEN,
      spaMode: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      deferredActionsMap: DEFERRED_ACTIONS_MAP_TOKEN,
      actionExecution: ACTION_EXECUTION_TOKEN,
    },
  },
  {
    provide: commandLineListTokens.afterSpaTransition,
    multi: true,
    useFactory: ({ spaMode, ...deps }: any) => {
      if (spaMode === 'after') {
        return runActionsFactory(deps);
      }

      return noop;
    },
    deps: {
      store: STORE_TOKEN,
      router: ROUTER_TOKEN,
      actionRegistry: ACTION_REGISTRY_TOKEN,
      actionPageRunner: ACTION_PAGE_RUNNER_TOKEN,
      spaMode: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
    },
  },
];
