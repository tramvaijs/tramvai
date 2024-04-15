import { createApp, provide } from '@tramvai/core';
import { CommonModule, ENV_USED_TOKEN } from '@tramvai/module-common';
import { RENDER_SLOTS, RenderModule, ResourceSlot, ResourceType } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { modules } from '@tramvai/internal-test-utils/shared/common';
import {
  MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
  TramvaiMicroSentryModule,
} from '@tramvai/module-micro-sentry';

createApp({
  name: 'micro-sentry-app',
  modules: [
    TramvaiMicroSentryModule,
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    ...modules,
  ],
  bundles: {
    test: () => import(/* webpackChunkName: "test" */ './bundles/testPage'),
  },
  providers: [
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ microSentryInlineErrorInterceptorKey }) => {
        return {
          slot: ResourceSlot.HEAD_CORE_SCRIPTS,
          type: ResourceType.inlineScript,
          payload: `window.${microSentryInlineErrorInterceptorKey}.errorsQueue.push(new Error('this error was thrown before micro-sentry loaded'))`,
        };
      },
      deps: {
        microSentryInlineErrorInterceptorKey: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      multi: true,
      useValue: [
        {
          key: 'SENTRY_DSN',
          value: 'https://tramvai_example_app_error_hub@error-hub.tinkoff.ru/1',
        },
      ],
    }),
  ],
});
