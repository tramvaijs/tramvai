import type { ReactElement } from 'react';
import React, { createElement } from 'react';
import { commandLineListTokens, createApp, provide } from '@tramvai/core';
import { CommonModule, REQUEST_MANAGER_TOKEN, STORE_TOKEN } from '@tramvai/module-common';
import {
  SpaRouterModule,
  ROUTER_GUARD_TOKEN,
  setPageErrorEvent,
  PAGE_SERVICE_TOKEN,
} from '@tramvai/module-router';
import { EXTEND_RENDER, RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN } from '@tramvai/react';
import { HttpError, throwHttpError } from '@tinkoff/errors';
import { parse } from '@tinkoff/url';
import { DEFAULT_ERROR_BOUNDARY_COMPONENT } from '@tramvai/tokens-render';
import {
  PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,
  PageRenderModeModule,
} from '@tramvai/module-page-render-mode';
import Fallback from './components/Fallback';
import { LegacyErrorBoundary } from './components/LegacyErrorBoundary';
import { TokenDefaultErrorBoundary } from './components/TokenDefaultErrorBoundary';
import ExtendRenderHocWithError from './components/ExtendRenderHOCWithError';

createApp({
  name: 'render-error-boundary',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([
      {
        name: 'success',
        path: '/',
        config: {
          pageComponent: 'pageComponent',
        },
      },
      {
        name: 'page-error-default-fallback',
        path: '/page-error-default-fallback/',
        config: {
          pageComponent: 'errorPageComponent',
        },
      },
      {
        name: 'page-error-specific-fallback',
        path: '/page-error-specific-fallback/',
        config: {
          pageComponent: 'errorPageComponent',
          errorBoundaryComponent: 'pageErrorBoundaryComponent',
        },
      },
      {
        name: 'page-error-fs-specific-fallback',
        path: '/page-error-fs-specific-fallback/',
        config: {
          pageComponent: '@/pages/error-page',
          errorBoundaryComponent: '@/pages/error-boundary',
        },
      },
      {
        name: 'page-error-not-existed',
        path: '/page-error-not-existed/',
        config: {
          pageComponent: 'notExistedPageComponent',
        },
      },
      {
        name: 'legacy-error-boundary',
        path: '/legacy-error-boundary/',
        config: {
          bundle: 'legacy',
        },
      },
      {
        name: 'token-default-error-boundary',
        path: '/token-default-error-boundary/',
        config: {
          bundle: 'error',
        },
      },
      {
        name: 'page-action-error',
        path: '/page-action-error/',
        config: {
          pageComponent: 'pageActionErrorComponent',
        },
      },
      {
        name: 'page-guard-error',
        path: '/page-guard-error/',
        config: {
          pageComponent: 'pageGuardErrorComponent',
        },
      },
      {
        name: 'global-error',
        path: '/global-error/',
        config: {},
      },
      {
        name: 'page-error-nested-layout',
        path: '/page-error-nested-layout/',
        config: {
          pageComponent: 'errorPageComponent',
          nestedLayoutComponent: 'nestedLayoutComponent',
          errorBoundaryComponent: 'pageErrorBoundaryComponent',
        },
      },
      {
        name: 'page-error-nested-layout-error',
        path: '/page-error-nested-layout-error/',
        config: {
          pageComponent: 'errorPageComponent',
          nestedLayoutComponent: 'errorNestedLayoutComponent',
          errorBoundaryComponent: 'pageErrorBoundaryComponent',
        },
      },
      {
        name: 'extend-render-error',
        path: '/extend-render-error/',
        config: {
          pageComponent: 'pageComponent',
        },
      },
      {
        name: 'csr-extend-render-error',
        path: '/csr-extend-render-error/',
        config: {
          pageComponent: 'pageComponent',
        },
      },
      {
        name: 'csr-extend-render-use-effect-error',
        path: '/csr-extend-render-use-effect-error/',
        config: {
          pageComponent: 'pageComponent',
        },
      },
      {
        name: 'error-on-client-in-layout',
        path: '/error-on-client-in-layout/',
        config: {
          pageComponent: 'pageComponent',
          nestedLayoutComponent: 'errorNestedLayoutComponentForClient',
        },
      },
    ]),
    RenderModule,
    ServerModule,
    PageRenderModeModule,
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: 'mainDefault' */ './bundles/mainDefault'),
    legacy: () => import(/* webpackChunkName: 'legacy' */ './bundles/legacy'),
    error: () => import(/* webpackChunkName: 'error' */ './bundles/error'),
  },
  providers: [
    provide({
      provide: ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN,
      useValue: React.createElement(LegacyErrorBoundary),
    }),
    ...(process.env.TEST_DEFAULT_ERROR_BOUNDARY
      ? [
          provide({
            provide: DEFAULT_ERROR_BOUNDARY_COMPONENT,
            useValue: TokenDefaultErrorBoundary,
          }),
        ]
      : []),
    provide({
      provide: ROUTER_GUARD_TOKEN,
      multi: true,
      useFactory: ({ store }): typeof ROUTER_GUARD_TOKEN => {
        return async ({ to }) => {
          if (to?.path === '/page-guard-error/') {
            const error = new HttpError({
              httpStatus: 503,
            });

            store.dispatch(setPageErrorEvent(error));
          }
        };
      },
      deps: {
        store: STORE_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ requestManager }) => {
        return function throwGlobalError() {
          if (parse(requestManager.getUrl()).path === '/global-error/') {
            throwHttpError({ message: 'Global Error', httpStatus: 503 });
          }
        };
      },
      deps: {
        requestManager: REQUEST_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: EXTEND_RENDER,
      multi: true,
      useFactory: ({ pageService }) => {
        return (render: ReactElement) => {
          if (pageService.getCurrentRoute().path === '/extend-render-error/') {
            throw new Error('EXTEND_RENDER error');
          }

          if (
            pageService.getCurrentRoute().path === '/csr-extend-render-error/' &&
            typeof window !== 'undefined'
          ) {
            throw new Error('EXTEND_RENDER CSR error');
          }

          if (pageService.getCurrentRoute().path === '/csr-extend-render-use-effect-error/') {
            return createElement(ExtendRenderHocWithError, null, render);
          }

          return render;
        };
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
      },
    }),
    provide({
      provide: PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,
      useValue: Fallback,
    }),
  ],
});
