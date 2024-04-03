import { declareModule, provide } from '@tramvai/core';
import { MICRO_SENTRY_INSTANCE_TOKEN } from './tokens';

export * from './tokens';

export const TramvaiMicroSentryModule = declareModule({
  name: 'TramvaiMicroSentryModule',
  imports: [],
  providers: [
    provide({
      provide: MICRO_SENTRY_INSTANCE_TOKEN,
      useFactory: () => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            'micro-sentry will work only in browser environment, and will not work in server environment. If you need error logging both on server and client, take a look on @tramvai/module-sentry package'
          );
        }
        return null;
      },
    }),
  ],
});
