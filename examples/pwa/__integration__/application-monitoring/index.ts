import {
  commandLineListTokens,
  createApp,
  createBundle,
  provide,
  TRAMVAI_HOOKS_TOKEN,
} from '@tramvai/core';
import {
  ASYNC_LOCAL_STORAGE_TOKEN,
  COMBINE_REDUCERS,
  CommonModule,
  RESPONSE_MANAGER_TOKEN,
  STORE_TOKEN,
} from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
import { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { ServerModule } from '@tramvai/module-server';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';
import { TramvaiPwaLightModule } from '@tramvai/module-progressive-web-app';
import { SpaRouterModule } from '@tramvai/module-router';

import {
  ApplicationMonitoringModule,
  INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
  TramvaiInlineReporter,
  InlineReporterParameters,
} from '@tramvai/module-application-monitoring';

import Page from './page';
import { SsrErrorPage } from './ssr-error-page';
import { SsrRecoverableErrorPage } from './ssr-recoverable-error-page';
import { ssrHooksStore, addSsrHookEvent } from './ssr-hooks-store';

createApp({
  name: 'app-monitoring',
  modules: [
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    TramvaiPwaLightModule,
    ApplicationMonitoringModule,
    SpaRouterModule.forRoot([
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/simple-with-fail-token',
        name: 'simple-with-fail-token',
      },
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/simple-with-error',
        name: 'simple-with-error',
      },
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/simple/',
        name: 'simple',
      },
      {
        config: {
          bundle: 'mainDefault',
          pageComponent: 'ssr-error',
        },
        path: '/ssr-error/',
        name: 'ssr-error',
      },
      {
        config: {
          bundle: 'mainDefault',
          pageComponent: 'ssr-recoverable-error',
        },
        path: '/ssr-recoverable-error/',
        name: 'ssr-recoverable-error',
      },
    ]),
  ],
  bundles: {
    mainDefault: () =>
      Promise.resolve({
        default: createBundle({
          name: 'mainDefault',
          components: {
            pageDefault: Page,
            'ssr-error': SsrErrorPage,
            'ssr-recoverable-error': SsrRecoverableErrorPage,
          },
        }),
      }),
  },
  providers: [
    provide({
      provide: REACT_SERVER_RENDER_MODE,
      useValue: 'blocking',
    }),
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [ssrHooksStore],
      multi: true,
    }),
    provide({
      provide: ERROR_BOUNDARY_TOKEN,
      useFactory: () => {
        return (error: any) => {
          (window as any).errorBoundary = true;
        };
      },
    }),
    provide({
      provide: commandLineListTokens.generatePage,
      useFactory: ({ router }) => {
        const route = router.getCurrentRoute();
        return () => {
          if (route.actualPath === '/simple-with-fail-token/' && typeof window !== 'undefined') {
            throw new Error('FAIL');
          }
          if (route.actualPath === '/simple-with-error/') {
            if (typeof window !== 'undefined') {
              const script = document.createElement('script');
              script.src = 'https://example.com/non-existent.js';
              script.dataset.critical = 'true';
              document.head.appendChild(script);
            }
          }
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.init,
      useFactory: ({ hooks, asyncLocalStorage }) => {
        const getRequestDi = () => asyncLocalStorage?.getStore()?.tramvaiRequestDi;

        const trackSsrHook = (hookName: string) => {
          const di = getRequestDi();
          di?.get({ token: STORE_TOKEN, optional: true })?.dispatch(addSsrHookEvent(hookName));

          const responseManager = di?.get({
            token: RESPONSE_MANAGER_TOKEN,
            optional: true,
          });
          if (responseManager) {
            const existing = responseManager.getHeader('x-ssr-hooks');
            const prev = typeof existing === 'string' && existing ? existing : '';
            responseManager.setHeader('x-ssr-hooks', prev ? `${prev},${hookName}` : hookName);
          }
        };

        return () => {
          if (typeof window === 'undefined') {
            hooks['app:rendered'].tap('ssr-hooks-tracking', () => {
              trackSsrHook('app:rendered');
            });
            hooks['app:render-failed'].tap('ssr-hooks-tracking', () => {
              trackSsrHook('app:render-failed');
            });
            hooks['react:render'].tap('ssr-hooks-tracking', () => {
              trackSsrHook('react:render');
            });
            hooks['react:error'].tap('ssr-hooks-tracking', (_, { event }) => {
              trackSsrHook(`react:error:${event}`);
            });
          } else {
            hooks['app:initialized'].tap('app-init', () => {
              (window as any).appInit = true;
            });
            hooks['app:initialize-failed'].tap('app-init-failed', () => {
              (window as any).appInitFailed = true;
            });
            hooks['app:rendered'].tap('app-rendered', () => {
              (window as any).appRendered = true;
            });
            hooks['app:render-failed'].tap('app-render-failed', () => {
              (window as any).appRenderFailed = true;
            });
            hooks['react:error'].tap('react-error', () => {
              (window as any).reactError = true;
            });
          }
        };
      },
      deps: {
        hooks: TRAMVAI_HOOKS_TOKEN,
        asyncLocalStorage: {
          token: ASYNC_LOCAL_STORAGE_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
      useFactory: () => {
        return (inlineReporterParameters: InlineReporterParameters) => {
          class TramvaiInlineReporterImpl implements TramvaiInlineReporter {
            appName: string;
            appRelease: string | undefined;
            appVersion: string | undefined;
            constructor({ appName, appRelease, appVersion }: InlineReporterParameters) {
              this.appName = appName;
              this.appRelease = appRelease;
              this.appVersion = appVersion;
            }

            send(eventName: string, _payload: { [x: string]: any }) {
              (window as any)[eventName] = true;
            }
          }

          return new TramvaiInlineReporterImpl(inlineReporterParameters);
        };
      },
      deps: {},
    }),
  ],
});
