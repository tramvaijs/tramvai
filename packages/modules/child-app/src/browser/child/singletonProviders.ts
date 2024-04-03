import noop from '@tinkoff/utils/function/noop';
import type { Container } from '@tinkoff/dippy';
import type { Provider } from '@tramvai/core';
import { provide } from '@tramvai/core';
import {
  CHILD_APP_INTERNAL_ROOT_STATE_SUBSCRIPTION_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
  commandLineListTokens,
} from '@tramvai/tokens-child-app';
import { ACTION_PAGE_RUNNER_TOKEN, CONTEXT_TOKEN } from '@tramvai/tokens-common';
import { Subscription } from '@tramvai/state';
import { ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN } from '@tramvai/tokens-router';

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
      useFactory: ({ spaMode, actionRunner, childAppPageService }) => {
        if (spaMode !== 'after') {
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
        spaMode: {
          token: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
          optional: true,
        },
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
        spaMode: {
          token: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
          optional: true,
        },
      },
    }),
  ];
};
