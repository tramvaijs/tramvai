import flatten from '@tinkoff/utils/array/flatten';
import type { Container } from '@tinkoff/dippy';
import type { Provider } from '@tramvai/core';
import { Scope, provide } from '@tramvai/core';
import { ActionRegistry } from '@tramvai/module-common';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { RENDER_SLOTS } from '@tramvai/tokens-render';
import {
  CHILD_APP_ACTIONS_REGISTRY_TOKEN,
  CHILD_APP_INTERNAL_ACTION_TOKEN,
} from '@tramvai/tokens-child-app';
import { getChildProviders as getChildEndProviders } from '../../server/child/singletonProviders';

export const getChildProviders = (appDi: Container): Provider[] => {
  const logger = appDi.get(LOGGER_TOKEN);

  return [
    provide({
      provide: LOGGER_TOKEN,
      useValue: Object.assign((opts: any) => {
        return logger('child-app').child(opts);
      }, logger),
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: [],
    }),
    provide({
      provide: CHILD_APP_ACTIONS_REGISTRY_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ actionsList }) => {
        return new ActionRegistry({ actionsList: flatten(actionsList) });
      },
      deps: {
        actionsList: CHILD_APP_INTERNAL_ACTION_TOKEN,
      },
    }),
    ...getChildEndProviders(appDi),
  ];
};
