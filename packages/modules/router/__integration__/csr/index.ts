import { createApp } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PageRenderModeModule } from '@tramvai/module-page-render-mode';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { providers } from './csr-project/providers';
import { routes } from './csr-project/config';

createApp({
  name: 'csr-router',
  modules: [
    CommonModule,
    RenderModule,
    ServerModule,
    SpaRouterModule.forRoot(routes),
    PageRenderModeModule,
  ],
  providers,
  bundles: {
    mainDefault: () =>
      import(/* webpackChunkName: "mainDefault" */ './csr-project/bundles/default'),
    test: () => import(/* webpackChunkName: "test" */ './csr-project/bundles/testBundle'),
    lazy: () => import(/* webpackChunkName: "lazy" */ './csr-project/bundles/lazy'),
    'action-redirect': () =>
      import(/* webpackChunkName: 'action-redirect' */ './csr-project/bundles/action-redirect'),
    'use-route': () =>
      import(/* webpackChunkName: "use-route" */ './csr-project/bundles/use-route'),
    history: () => import(/* webpackChunkName: "history" */ './csr-project/bundles/history'),
    'dom-navigate': () =>
      import(/* webpackChunkName: "dom-navigate" */ './csr-project/bundles/dom-navigate'),
    'bundle-reducer': () =>
      import(/* webpackChunkName: "bundle-reducer" */ './csr-project/bundles/bundle-reducer'),
  },
});
