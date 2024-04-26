import { commandLineListTokens, provide, type Provider } from '@tramvai/core';
import { ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/module-common';
import type { BrowserSentryClientOptions } from '@micro-sentry/browser';
import { BrowserMicroSentryClient } from '@micro-sentry/browser';
import {
  MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
  MICRO_SENTRY_INSTANCE_TOKEN,
  MICRO_SENTRY_OPTIONS_TOKEN,
} from './tokens';

export const sharedProviders: Provider[] = [
  provide({
    provide: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
    useValue: '__MICRO_SENTRY_MODULE_INLINE_ERROR_INTERCEPTOR__',
  }),
];

export const browserProviders: Provider[] = [
  ...sharedProviders,
  provide({
    provide: ENV_USED_TOKEN,
    useValue: [
      { key: 'SENTRY_DSN' },
      {
        key: 'SENTRY_ENVIRONMENT',
        optional: true,
      },
      {
        key: 'SENTRY_RELEASE',
        optional: true,
      },
    ],
  }),
  provide({
    provide: MICRO_SENTRY_INSTANCE_TOKEN,
    useFactory: ({ microSentryOptions, envManager }) => {
      const defaultOptions: BrowserSentryClientOptions = {
        environment: envManager.get('SENTRY_ENVIRONMENT'),
        release: envManager.get('SENTRY_RELEASE'),
        dsn: envManager.get('SENTRY_DSN'),
      };

      const options = (microSentryOptions ?? []).reduce(
        (previousOptions, microSentryOptionsItem) => {
          return {
            ...previousOptions,
            ...microSentryOptionsItem,
          };
        },
        defaultOptions
      );

      return new BrowserMicroSentryClient(options);
    },
    deps: {
      envManager: ENV_MANAGER_TOKEN,
      microSentryOptions: { token: MICRO_SENTRY_OPTIONS_TOKEN, optional: true },
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ microSentry, microSentryInlineErrorInterceptorKey }) => {
      return function initMicroSentry() {
        const errorInterceptor = (window as any)[microSentryInlineErrorInterceptorKey];

        errorInterceptor.onError = (error: Error) => {
          microSentry?.report(error);
        };

        while (errorInterceptor?.errorsQueue?.length) {
          const error = errorInterceptor.errorsQueue.pop();
          errorInterceptor.onError(error);
        }

        return microSentry;
      };
    },
    deps: {
      microSentry: MICRO_SENTRY_INSTANCE_TOKEN,
      microSentryInlineErrorInterceptorKey: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
    },
  }),
];
