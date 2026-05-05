import { provide, Scope } from '@tinkoff/dippy';
import { createChildApp } from '@tramvai/child-app-core';
import {
  CommonChildAppModule,
  LOGGER_INIT_HOOK,
  LOGGER_TOKEN,
  LoggerFactory,
} from '@tramvai/module-common';
import { ReactQueryModule } from '@tramvai/module-react-query';
import { createAction } from '@tramvai/core';
import { Cmp } from './component';
import { query } from './query';
import { FAKE_API_CLIENT } from '../../shared/tokens';

// support old Child Apps versions for integration tests matrix
const { CHILD_REQUIRED_CONTRACTS } = require('@tramvai/child-app-core');

const logAction = createAction({
  name: 'logger-action-client-hints',
  fn(_context, _payload, deps) {
    deps.logger('react-query').info('react-query');
  },
  conditions: {
    always: true,
    onlyBrowser: true,
  },
  deps: {
    logger: LOGGER_TOKEN,
  },
});

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'react-query',
  render: Cmp,
  modules: [CommonChildAppModule, ReactQueryModule],
  actions: [query.prefetchAction(), logAction],

  providers: CHILD_REQUIRED_CONTRACTS
    ? [
        provide({
          provide: CHILD_REQUIRED_CONTRACTS,
          // required when CA used in 2.0.0 tramvai host app
          multi: true,
          useValue: [FAKE_API_CLIENT],
        }),
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
                    customField: 'react-query',
                  };
                },
              });
              return loggerInstance;
            };
          },
        }),
      ]
    : [],
});
