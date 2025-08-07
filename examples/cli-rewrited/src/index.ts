import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import { DEFAULT_HEADER_COMPONENT } from '@tramvai/tokens-render';
import { TramvaiPwaModule } from '@tramvai/module-progressive-web-app';

// Assets import check
import icon from './images/plus.svg';
import logo from './images/logo.svg';
import city from './images/city.jpg';
import tbank, { image } from './images/tbank.png';

import { Header } from './components/features/Header/Header';

import './app.module.css';

if (typeof window !== 'undefined') {
  console.log(icon, logo, city, tbank);
}

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
