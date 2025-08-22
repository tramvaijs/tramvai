import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { MetricsModule } from '@tramvai/module-metrics';
import { PageRenderModeModule } from '@tramvai/module-page-render-mode';
import { RenderModule, TRAMVAI_RENDER_MODE } from '@tramvai/module-render';
import {
  ROUTER_GUARD_TOKEN,
  ROUTER_VIEW_TRANSITIONS_ENABLED,
  SpaRouterModule,
} from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';

createApp({
  name: 'view-transition',
  modules: [
    CommonModule,
    MetricsModule,
    SpaRouterModule.forRoot([
      {
        name: 'pageA',
        path: '/',
      },
      {
        name: 'pageB',
        path: '/b',
        config: {
          pageComponent: 'pageB',
        },
      },
    ]),
    RenderModule,
    ServerModule,
    PageRenderModeModule,
  ],
  providers: [
    provide({
      provide: ROUTER_VIEW_TRANSITIONS_ENABLED,
      useValue: true,
    }),
    provide({
      provide: TRAMVAI_RENDER_MODE,
      useValue: 'client',
    }),
    provide({
      provide: ROUTER_GUARD_TOKEN,
      multi: true,
      useFactory: (deps) => async (navigation) => {
        if (typeof window !== 'undefined') {
          const shouldRedirect = navigation.to?.actualPath === '/';
          return shouldRedirect ? '/b' : undefined;
        }
      },
      deps: {},
    }),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/mainDefault'),
  },
});
