import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { MetricsModule } from '@tramvai/module-metrics';
import { RenderModule } from '@tramvai/module-render';
import { ROUTER_VIEW_TRANSITIONS_ENABLED, SpaRouterModule } from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';
import { AutoscrollModule } from '../lib';

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
    AutoscrollModule,
  ],
  providers: [
    provide({
      provide: ROUTER_VIEW_TRANSITIONS_ENABLED,
      useFactory: () => {
        return process.env.TEST_VIEW_TRANSITIONS_ENABLED === 'true';
      },
    }),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/mainDefault'),
  },
});
