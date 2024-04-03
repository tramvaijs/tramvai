import { createApp, provide } from '@tramvai/core';
import { COMBINE_REDUCERS, CommonModule, COOKIE_MANAGER_TOKEN } from '@tramvai/module-common';
import { ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN, SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { actionsReducer } from './stores/actionTestReducer';

createApp({
  name: 'common',
  modules: [
    CommonModule,
    RenderModule,
    ServerModule,
    SpaRouterModule.forRoot([
      {
        name: 'action-test-start',
        path: '/action-test-start/',
        config: {
          pageComponent: 'actionTestPageStart',
        },
      },
      {
        name: 'action-test-end',
        path: '/action-test-end/',
        config: {
          pageComponent: 'actionTestPageEnd',
        },
      },
      {
        name: 'action-test-end-redirect',
        path: '/action-test-redirect/',
        redirect: '/action-test-end/',
      },
      {
        name: 'action-execution-on-server',
        path: '/action-execution-on-server/',
        config: {
          pageComponent: 'actionExecutionOnServer',
        },
      },
    ]),
  ],
  providers: [
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [actionsReducer],
    }),
    provide({
      provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      useFactory: ({ cookieManager }) => {
        return cookieManager.get('actionsMode') === 'before' ? 'before' : 'after';
      },
      deps: {
        cookieManager: COOKIE_MANAGER_TOKEN,
      },
    }),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/default'),
  },
});
