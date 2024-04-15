import { declareModule, provide } from '@tramvai/core';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import {
  MICRO_SENTRY_INSTANCE_TOKEN,
  MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
  MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN,
} from './tokens';
import { createErrorInterceptor } from './inlineErrorInterceptor.inline';

import { sharedProviders } from './providers';

export * from './tokens';

export const TramvaiMicroSentryModule = declareModule({
  name: 'TramvaiMicroSentryModule',
  imports: [],
  providers: [
    ...sharedProviders,
    provide({
      provide: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN,
      useFactory: ({ microSentryInlineErrorInterceptorKey }) => {
        return `(${createErrorInterceptor})('${microSentryInlineErrorInterceptorKey}')`;
      },
      deps: {
        microSentryInlineErrorInterceptorKey: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ payload }) => {
        return {
          slot: ResourceSlot.HEAD_CORE_SCRIPTS,
          type: ResourceType.inlineScript,
          payload,
        };
      },
      deps: {
        payload: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN,
      },
    }),
    provide({
      provide: MICRO_SENTRY_INSTANCE_TOKEN,
      useFactory: () => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(
            'micro-sentry will work only in browser environment, and will not work in server environment. If you need error logging both on server and client, take a look on @tramvai/module-sentry package'
          );
        }
        return null;
      },
    }),
  ],
});
