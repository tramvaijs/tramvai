import { createApp } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import {
  RENDER_SLOTS,
  ResourceType,
  ResourceSlot,
  INLINE_WEBPACK_RUNTIME,
} from '@tramvai/tokens-render';

createApp({
  name: 'assets',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    ErrorInterceptorModule,
  ],
  providers: [
    {
      provide: INLINE_WEBPACK_RUNTIME,
      useValue: process.env.TEST_INLINE_RUNTIME === 'true',
    },
    {
      provide: RENDER_SLOTS,
      multi: true,
      useValue: {
        type: ResourceType.asIs,
        slot: ResourceSlot.HEAD_META,
        payload: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      },
    },
  ],
});
