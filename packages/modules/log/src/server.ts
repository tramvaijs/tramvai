import each from '@tinkoff/utils/array/each';
import split from '@tinkoff/utils/string/split';
import { hostname } from 'os';
import env from 'std-env';
import type { ExtractDependencyType } from '@tramvai/core';
import { Module, Scope, provide } from '@tramvai/core';
import {
  LOGGER_TOKEN,
  LOGGER_INIT_HOOK,
  LOGGER_SHARED_CONTEXT,
  ASYNC_LOCAL_STORAGE_TOKEN,
} from '@tramvai/tokens-common';
import { ENV_USED_TOKEN } from '@tramvai/module-environment';
import type { Extension, LogObj } from '@tinkoff/logger';
import {
  createLoggerFactory,
  JSONReporter,
  LEVELS,
  NodeBasicReporter,
  NodeDevReporter,
} from '@tinkoff/logger';
import { serverProviders } from './devLogs';
import { LOGGER_NAME, LOGGER_KEY } from './constants';
import './types';

export * from './LogStore';

export { LOGGER_TOKEN };

const DefaultReporter = env.ci || env.test ? NodeBasicReporter : NodeDevReporter;
const reporter =
  process.env.DEBUG_PLAIN || process.env.NODE_ENV !== 'production'
    ? new DefaultReporter()
    : new JSONReporter();

const logger = createLoggerFactory({
  name: LOGGER_NAME,
  key: LOGGER_KEY,
  reporters: [reporter],
  defaults: {
    pid: process.pid,
    hostname: hostname(),
  },
});

export { logger };

export function factory({ environmentManager, loggerInitHooks }) {
  const level = environmentManager.get('LOG_LEVEL') ?? environmentManager.get('DEBUG_LEVEL');
  const enable = environmentManager.get('LOG_ENABLE') ?? environmentManager.get('DEBUG_ENABLE');

  logger.clear();
  logger.setLevel(level as any);

  if (enable) {
    each((val) => {
      const [lvl, ...name] = val.split(':');

      if (lvl in LEVELS) {
        logger.enable(lvl, name.join(':'));
      } else {
        logger.enable(val);
      }
    }, split(',', enable));
  }

  if (loggerInitHooks) {
    for (const hookFn of loggerInitHooks) {
      hookFn(logger);
    }
  }

  return logger;
}

/**
 * At server-side, when using LOGGER_SHARED_CONTEXT, new properties will be stored in current
 * AsyncLocalStorage context (which is unique for each user request).
 * This extension will read current properties from context, it allows us to automatically bind
 * user-specific properties (user-agent, ip, etc.) to all logs, called in complete different places in application code.
 */
class LoggerSharedContextExtension implements Extension {
  private storage: ExtractDependencyType<typeof ASYNC_LOCAL_STORAGE_TOKEN>;

  constructor({ storage }: { storage: ExtractDependencyType<typeof ASYNC_LOCAL_STORAGE_TOKEN> }) {
    this.storage = storage;
  }

  extend(logObj: LogObj) {
    const state = this.storage.getStore()?.logger;

    if (state) {
      state.forEach((value, key) => {
        const keyExist = key in logObj;
        const valueIsNotEmpty = typeof value !== 'undefined';

        if (!keyExist && valueIsNotEmpty) {
          // eslint-disable-next-line no-param-reassign
          logObj[key] = value;
        }
      });
    }

    return logObj;
  }
}

@Module({
  providers: [
    ...(process.env.NODE_ENV === 'development' ? serverProviders : []),
    {
      provide: LOGGER_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: factory,
      deps: {
        environmentManager: 'environmentManager',
        loggerInitHooks: { token: LOGGER_INIT_HOOK, optional: true, multi: true },
      },
    },
    {
      provide: ENV_USED_TOKEN,
      useValue: [
        { key: 'LOG_LEVEL', optional: true, dehydrate: false },
        { key: 'LOG_ENABLE', optional: true, dehydrate: false },
        { key: 'APP_VERSION', optional: true, dehydrate: true },
        { key: 'APP_RELEASE', optional: true, dehydrate: true },
        /**
         * @deprecated используйте LOG_LEVEL
         */
        { key: 'DEBUG_LEVEL', optional: true, dehydrate: false, value: 'warn' },
        /**
         * @deprecated используйте LOG_ENABLE
         */
        { key: 'DEBUG_ENABLE', optional: true, dehydrate: false },
      ],
      multi: true,
    },
    provide({
      provide: LOGGER_INIT_HOOK,
      multi: true,
      scope: Scope.SINGLETON,
      useFactory: ({ storage }) => {
        const loggerSharedContextExtension = new LoggerSharedContextExtension({ storage });

        return (loggerInstance) => {
          return loggerInstance.addExtension(loggerSharedContextExtension);
        };
      },
      deps: {
        storage: ASYNC_LOCAL_STORAGE_TOKEN,
      },
    }),
    provide({
      provide: LOGGER_SHARED_CONTEXT,
      scope: Scope.SINGLETON,
      useFactory: ({ storage }) => {
        return {
          get(key: string) {
            return storage.getStore()?.logger?.get(key);
          },
          set(key: string, value: any) {
            const store = storage.getStore();

            if (!store) {
              return;
            }

            if (!store?.logger) {
              store.logger = new Map();
            }

            store.logger.set(key, value);
          },
        };
      },
      deps: {
        storage: ASYNC_LOCAL_STORAGE_TOKEN,
      },
    }),
  ],
})
export class LogModule {}
