import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import { DEFAULT_HEADER_COMPONENT } from '@tramvai/tokens-render';
import { TramvaiPwaModule } from '@tramvai/module-progressive-web-app';

import { Header } from './components/features/Header/Header';

import './app.module.css';

createApp({
  name: 'pwa',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    TramvaiPwaModule,
    ErrorInterceptorModule,
  ],
  providers: [
    provide({
      provide: DEFAULT_HEADER_COMPONENT,
      useValue: Header,
    }),
  ],
});
