import { BrowserReporter, createLoggerFactory } from '@tinkoff/logger';
import type { LogObj } from '@tinkoff/logger';
import { Module, Scope, optional, provide } from '@tramvai/core';
import {
  LOGGER_TOKEN,
  LOGGER_INIT_HOOK,
  LOGGER_REMOTE_REPORTER,
  LOGGER_SHARED_CONTEXT,
} from '@tramvai/tokens-common';
import { LOGGER_NAME, LOGGER_KEY } from './constants';

import { clientProviders } from './devLogs';

export * from './LogStore';

export { LOGGER_TOKEN };

const logger = createLoggerFactory({
  name: LOGGER_NAME,
  key: LOGGER_KEY,
  reporters: [new BrowserReporter()],
});

export { logger };

@Module({
  providers: [
    ...(process.env.NODE_ENV === 'development' ? clientProviders : []),
    provide({
      provide: LOGGER_TOKEN,
      useFactory({ loggerInitHooks }) {
        if (loggerInitHooks) {
          for (const hookFn of loggerInitHooks) {
            hookFn(logger);
          }
        }

        return logger;
      },
      deps: {
        loggerInitHooks: { token: LOGGER_INIT_HOOK, multi: true, optional: true },
      },
    }),
    provide({
      provide: LOGGER_SHARED_CONTEXT,
      scope: Scope.SINGLETON,
      useValue: new Map(),
    }),
    provide({
      provide: LOGGER_INIT_HOOK,
      multi: true,
      useFactory({ remoteReporter, loggerSharedContext }) {
        return (loggerInstance) => {
          if (remoteReporter) {
            loggerInstance.addReporter(remoteReporter);
          }

          loggerInstance.addExtension({
            extend(logObj: LogObj): LogObj {
              return {
                ...Object.fromEntries(loggerSharedContext as Map<string, unknown>),
                ...logObj,
              };
            },
          });
        };
      },
      deps: {
        remoteReporter: optional(LOGGER_REMOTE_REPORTER),
        loggerSharedContext: LOGGER_SHARED_CONTEXT,
      },
    }),
  ],
})
export class LogModule {}
