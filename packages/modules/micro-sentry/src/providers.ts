import { commandLineListTokens, provide, type Provider } from '@tramvai/core';
import { ENV_USED_TOKEN } from '@tramvai/module-common';
import { BrowserMicroSentryClient } from '@micro-sentry/browser';
import { MICRO_SENTRY_INSTANCE_TOKEN, MICRO_SENTRY_OPTIONS_TOKEN } from './tokens';

export const sharedProviders: Provider[] = [
  provide({
    provide: ENV_USED_TOKEN,
    useValue: [{ key: 'SENTRY_DSN' }],
  }),
  provide({
    provide: MICRO_SENTRY_INSTANCE_TOKEN,
    useFactory: ({ microSentryOptions }) => {
      return new BrowserMicroSentryClient(microSentryOptions);
    },
    deps: {
      microSentryOptions: MICRO_SENTRY_OPTIONS_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ microSentry }) => {
      return function initMicroSentry() {
        return microSentry;
      };
    },
    deps: {
      microSentry: MICRO_SENTRY_INSTANCE_TOKEN,
    },
  }),
];
