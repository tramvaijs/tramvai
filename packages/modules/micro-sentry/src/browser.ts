import type { BrowserSentryClientOptions } from '@micro-sentry/browser';
import { declareModule, provide } from '@tramvai/core';
import { ENV_MANAGER_TOKEN } from '@tramvai/module-common';

import { browserProviders } from './providers';
import { MICRO_SENTRY_OPTIONS_TOKEN } from './tokens';

export * from './tokens';

export const TramvaiMicroSentryModule = declareModule({
  name: 'TramvaiMicroSentryModule',
  providers: [
    ...browserProviders,
    provide({
      provide: MICRO_SENTRY_OPTIONS_TOKEN,
      useFactory: ({ envManager }) => {
        const defaultOptions: BrowserSentryClientOptions = {
          environment: envManager.get('SENTRY_ENVIRONMENT') ?? process.env.NODE_ENV,
          release: envManager.get('SENTRY_RELEASE'),
          dsn: envManager.get('SENTRY_DSN'),
        };
        return defaultOptions;
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
  ],
  imports: [],
});
