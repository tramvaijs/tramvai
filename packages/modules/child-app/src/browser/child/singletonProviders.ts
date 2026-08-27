import noop from '@tinkoff/utils/function/noop';
import type { Container } from '@tinkoff/dippy';
import type { ExtractDependencyType, PageAction, Provider } from '@tramvai/core';
import { ACTION_PARAMETERS, provide } from '@tramvai/core';
import {
  CHILD_APP_COMMON_INITIAL_STATE_TOKEN,
  CHILD_APP_INTERNAL_ROOT_STATE_SUBSCRIPTION_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
  CHILD_REQUIRED_CONTRACTS,
  commandLineListTokens,
} from '@tramvai/tokens-child-app';
import {
  ACTION_EXECUTION_TOKEN,
  ACTION_PAGE_RUNNER_TOKEN,
  CONTEXT_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
} from '@tramvai/tokens-common';
import { Subscription } from '@tramvai/state';
import { ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN } from '@tramvai/tokens-router';
import { resetDeferredAction } from '@tramvai/module-router';

export const getChildProviders = (appDi: Container): Provider[] => {
  const context = appDi.get(CONTEXT_TOKEN);

  return [
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ subscriptions }) => {
        return async function resolveRootStateForChild() {
          if (!subscriptions) {
            return;
          }

          const state = context.getState();

          return Promise.all(
            subscriptions.map((sub) => {
              const subscription = new Subscription(sub.stores.map(context.getStore as any));

              subscription.setOnStateChange(() => {
                sub.listener(context.getState());
              });

              subscription.trySubscribe();

              return sub.listener(state);
            })
          );
        };
      },
      deps: {
        subscriptions: { token: CHILD_APP_INTERNAL_ROOT_STATE_SUBSCRIPTION_TOKEN, optional: true },
      },
    }),
    provide({
      provide: commandLineListTokens.clear,
      multi: true,
      useFactory: ({ actionRunner, childAppPageService }) => {
        return async function childAppRunActions() {
          await childAppPageService.resolveComponent();

          return actionRunner.runActions(childAppPageService.getActions());
        };
      },
      deps: {
        actionRunner: ACTION_PAGE_RUNNER_TOKEN,
        childAppPageService: CHILD_APP_PAGE_SERVICE_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.spaTransition,
      multi: true,
      useFactory: ({
        spaMode,
        actionRunner,
        childAppPageService,
        deferredActionsMap,
        actionExecution,
      }) => {
        return async function childAppRunActions() {
          await childAppPageService.resolveComponent();

          childAppPageService
            .getActions()
            .forEach((action) => resetDeferredAction(action, deferredActionsMap, actionExecution));

          if (spaMode !== 'after') {
            return actionRunner.runActions(childAppPageService.getActions());
          }
        };
      },
      deps: {
        actionRunner: ACTION_PAGE_RUNNER_TOKEN,
        childAppPageService: CHILD_APP_PAGE_SERVICE_TOKEN,
        spaMode: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
        deferredActionsMap: DEFERRED_ACTIONS_MAP_TOKEN,
        actionExecution: ACTION_EXECUTION_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.afterSpaTransition,
      multi: true,
      useFactory: ({ spaMode, actionRunner, childAppPageService }) => {
        if (spaMode === 'after') {
          return async function childAppRunActions() {
            await childAppPageService.resolveComponent();

            return actionRunner.runActions(childAppPageService.getActions());
          };
        }

        return noop;
      },
      deps: {
        actionRunner: ACTION_PAGE_RUNNER_TOKEN,
        childAppPageService: CHILD_APP_PAGE_SERVICE_TOKEN,
        spaMode: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      },
    }),
    provide({
      provide: CHILD_REQUIRED_CONTRACTS,
      useValue: [CHILD_APP_COMMON_INITIAL_STATE_TOKEN],
    }),
  ];
};
