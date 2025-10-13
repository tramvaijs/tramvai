import { createApp, provide } from '@tramvai/core';
import { HTTP_CLIENT_AGENT_INTERCEPTORS, HttpClientModule } from '@tramvai/module-http-client';
import { COMBINE_REDUCERS, CommonModule, STORE_TOKEN } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule, SERVER_MODULE_PAPI_PUBLIC_ROUTE } from '@tramvai/module-server';
import { createPapiMethod } from '@tramvai/papi';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common/src';
import { testPapiReducer } from './reducers/testPapi';
import { testDispatcherReducer, updateTestDispatcherState } from './reducers/testDispatcher';

createApp({
  name: 'http-client',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([
      {
        name: 'root',
        path: '/',
      },
      {
        name: 'http-client-papi',
        path: '/http-client-papi',
        config: {
          pageComponent: 'http-client-papi',
        },
      },
      {
        name: 'http-client-dispatcher',
        path: '/http-client-dispatcher',
        config: {
          pageComponent: 'http-client-dispatcher',
        },
      },
    ]),
    RenderModule,
    ServerModule,
    HttpClientModule,
  ],
  providers: [
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [testPapiReducer, testDispatcherReducer],
      multi: true,
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      multi: true,
      useFactory: () => {
        return createPapiMethod({
          method: 'get',
          path: '/async-papi-server',
          async handler() {
            return 'async-papi-server';
          },
        });
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      multi: true,
      useFactory: () => {
        return createPapiMethod({
          method: 'get',
          path: '/sync-papi-server',
          handler() {
            return 'sync-papi-server';
          },
        });
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      multi: true,
      useFactory: () => {
        return createPapiMethod({
          method: 'get',
          path: '/async-papi-browser',
          async handler() {
            return 'async-papi-browser';
          },
        });
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      multi: true,
      useFactory: () => {
        return createPapiMethod({
          method: 'get',
          path: '/sync-papi-browser',
          handler() {
            return 'sync-papi-browser';
          },
        });
      },
    }),
    ...(typeof window === 'undefined'
      ? [
          provide({
            provide: HTTP_CLIENT_AGENT_INTERCEPTORS,
            useFactory: ({ asyncLocalStorage }) => {
              return function testInterceptor(dispatch) {
                return function testInterceptorDispatch(opts, handler) {
                  if (opts.path === '/foo' || opts.path === '/bar') {
                    const storage = asyncLocalStorage.getStore();

                    if ((storage as any)?.tramvaiRequestDi) {
                      (storage as any).tramvaiRequestDi
                        .get(STORE_TOKEN)
                        .dispatch(updateTestDispatcherState(opts.path));
                    }
                  }
                  return dispatch(opts, handler);
                };
              };
            },
            deps: {
              asyncLocalStorage: ASYNC_LOCAL_STORAGE_TOKEN,
            },
          }),
        ]
      : []),
  ],
  bundles: {
    mainDefault: () => import(/* webpackChunkName: "mainDefault" */ './bundles/mainDefault'),
  },
});
