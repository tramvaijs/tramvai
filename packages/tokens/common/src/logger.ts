import type { Logger, Reporter } from '@tinkoff/logger';
import { createToken } from '@tinkoff/dippy';

/**
 * @description
 * Logger implementation
 */
export const LOGGER_TOKEN = createToken<LoggerFactory>('logger');

/**
 * @description
 * Hook to be able to modify logger on initialization
 */
export const LOGGER_INIT_HOOK = createToken<LoggerInitHook>('loggerHook', { multi: true });

/**
 * @description
 * Remote reporter for client logs
 */
export const LOGGER_REMOTE_REPORTER = createToken<Reporter>('remoteReporter');

/**
 * @description
 * Storage for dynamic log object properties
 */
export const LOGGER_SHARED_CONTEXT = createToken<LoggerSharedContext>(
  'tramvai logger shared context'
);

type Config = {
  name: string;
  [key: string]: any;
};

export type LoggerFactory = Logger & ((configOrName: string | Config) => Logger);

type LoggerInitHook = (logger: LoggerFactory) => void;

export type { Logger, LogFn, LogArg } from '@tinkoff/logger';

export interface LoggerSharedContext {
  get(key: string): any;
  set(key: string, value: any): void;
}
