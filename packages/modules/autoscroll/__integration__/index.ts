import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { MetricsModule } from '@tramvai/module-metrics';
import { RenderModule } from '@tramvai/module-render';
import {
  ROUTER_VIEW_TRANSITIONS_ENABLED,
  ROUTER_TOKEN,
  SpaRouterModule,
} from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';
import type { AutoscrollBehavior } from '../lib';
import {
  AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
  AUTOSCROLL_DISABLED_TOKEN,
  AUTOSCROLL_SCROLL_TOP_TOKEN,
  ScrollRestorationModule,
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
      {
        name: 'pageC',
        path: '/c/',
        config: {
          pageComponent: 'pageC',
        },
      },
    ]),
    RenderModule,
    ServerModule,
    ScrollRestorationModule,
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
      useValue: (defaultBehavior): AutoscrollBehavior => {
        const params = new URLSearchParams(window.location.search);
        return params.get('autoscroll_behavior') === 'auto' ? 'auto' : defaultBehavior;
      },
    }),
    provide({
      provide: AUTOSCROLL_DISABLED_TOKEN,
      useFactory:
        ({ router }) =>
        () => {
          if (router.getCurrentUrl().query.autoscroll_disabled === 'true') {
            return true;
          }
        },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
    provide({
      provide: AUTOSCROLL_SCROLL_TOP_TOKEN,
      useValue: (defaultScrollTop): number => {
        const stored = window.sessionStorage.getItem('autoscroll_scroll_top');
        return stored !== null ? Number(stored) : defaultScrollTop;
      },
    }),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/mainDefault'),
  },
});
