import type { Container } from '@tinkoff/dippy';
import type { Provider } from '@tramvai/core';
import { provide } from '@tramvai/core';
import { CHILD_APP_PAGE_SERVICE_TOKEN, commandLineListTokens } from '@tramvai/tokens-child-app';
import { ACTION_PAGE_RUNNER_TOKEN } from '@tramvai/tokens-common';

export const getChildProviders = (appDi: Container): Provider[] => {
  return [
    provide({
      provide: commandLineListTokens.resolvePageDeps,
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
  ];
};
