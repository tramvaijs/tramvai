import { createChildApp } from '@tramvai/child-app-core';
import { createAction, declareAction, provide, Scope } from '@tramvai/core';
import {
  CommonChildAppModule,
  LOGGER_INIT_HOOK,
  LOGGER_TOKEN,
  LoggerFactory,
} from '@tramvai/module-common';
import { BaseCmp } from './component';
import { CHILD_APP_BASE_TOKEN } from './tokens';

declare global {
  interface Window {
    TRAMVAI_TEST_CHILD_APP_NOT_PRELOADED_ACTION_CALL_NUMBER: number;
    TRAMVAI_TEST_CHILD_APP_FACTORY_CONDITION: number;
  }
}

if (typeof window !== 'undefined') {
  window.TRAMVAI_TEST_CHILD_APP_NOT_PRELOADED_ACTION_CALL_NUMBER = 0;
  window.TRAMVAI_TEST_CHILD_APP_FACTORY_CONDITION = 0;
}

const action = createAction({
  name: 'action',
  fn() {
    window.TRAMVAI_TEST_CHILD_APP_NOT_PRELOADED_ACTION_CALL_NUMBER++;
  },
  conditions: {
    always: true,
    onlyBrowser: true,
  },
});

const logAction = createAction({
  name: 'logger-action-base',
  fn(_context, _payload, deps) {
    deps.logger.info('base');
  },
  conditions: {
    always: true,
    onlyBrowser: true,
  },
  deps: {
    logger: LOGGER_TOKEN,
  },
});

const actionWithFactoryCondition = createAction({
  name: 'actionWithFactoryCondition',
  fn() {
    window.TRAMVAI_TEST_CHILD_APP_FACTORY_CONDITION++;
  },
  conditions: {
    factory: true,
    onlyBrowser: true,
  },
});

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'base',
  render: BaseCmp,
  modules: [CommonChildAppModule],
  actions: [logAction, action, actionWithFactoryCondition],
  providers: [
    provide({
      scope: Scope.SINGLETON,
      provide: LOGGER_INIT_HOOK,
      multi: true,
      useFactory: () => {
        return (loggerInstance: LoggerFactory) => {
          loggerInstance.addExtension({
            extend(logObj) {
              return {
                ...logObj,
                customField: 'base',
              };
            },
          });
          return loggerInstance;
        };
      },
    }),
    provide({
      provide: CHILD_APP_BASE_TOKEN,
      useValue: "I'm little child app",
    }),
  ],
});
