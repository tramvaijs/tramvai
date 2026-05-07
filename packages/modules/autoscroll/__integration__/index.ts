import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { MetricsModule } from '@tramvai/module-metrics';
import { RenderModule } from '@tramvai/module-render';
import { ROUTER_VIEW_TRANSITIONS_ENABLED, SpaRouterModule } from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';
import type { AutoscrollBehavior } from '../lib';
import {
  AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
  AUTOSCROLL_SCROLL_TOP_TOKEN,
  AutoscrollModule,
} from '../lib';

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
    provide({
      provide: AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
      useValue: (): AutoscrollBehavior => {
        if (typeof window === 'undefined') {
          return 'smooth';
        }
        const params = new URLSearchParams(window.location.search);
        return params.get('autoscroll_behavior') === 'auto' ? 'auto' : 'smooth';
      },
    }),
    provide({
      provide: AUTOSCROLL_SCROLL_TOP_TOKEN,
      useValue: (): number => {
        if (typeof window === 'undefined') {
          return 0;
        }
        const stored = window.sessionStorage.getItem('autoscroll_scroll_top');
        return stored !== null ? Number(stored) : 0;
      },
    }),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/mainDefault'),
  },
});
