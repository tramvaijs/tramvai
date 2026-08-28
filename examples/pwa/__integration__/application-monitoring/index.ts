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
import { RenderModule, TramvaiRetryAssetsModule } from '@tramvai/module-render';
import { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { ServerModule } from '@tramvai/module-server';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import {
  REACT_SERVER_RENDER_MODE,
  RESOURCES_REGISTRY,
  ResourceSlot,
  ResourceType,
} from '@tramvai/tokens-render';
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

/**
 * Breaks app creation for real: `createApp` wraps the `App` constructor in try/catch and
 * marks the error with the `appCreationError` flag, which `errorMonitoringScript` reacts
 * to by sending the `app-start-failed` event.
 *
 * The constructor only registers providers (modules are resolved later, in
 * `initialization`), so the only way to break the constructor itself is to pass an invalid
 * provider. Provider format validation in DI only runs when `NODE_ENV !== 'production'`,
 * and integration apps are started in dev mode.
 *
 * Broken on the client only and only by a query parameter, otherwise both SSR and every
 * other test of this app would fail.
 */
const isBrokenAppRequested =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('breakAppCreation');

const brokenProviders = isBrokenAppRequested
  ? [
      // a provider without useValue/useClass/useFactory - invalid format
      { provide: 'broken-provider-for-app-creation-error' } as any,
    ]
  : [];

createApp({
  name: 'app-monitoring',
  modules: [
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    TramvaiPwaLightModule,
    ApplicationMonitoringModule,
    // asset failures are reported to monitoring by the retry script, through the
    // `ASSET_LOAD_FAIL` error protocol
    TramvaiRetryAssetsModule,
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
        path: '/failed-critical-css/',
        name: 'failed-critical-css',
      },
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/failed-non-critical-asset/',
        name: 'failed-non-critical-asset',
      },
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/retried-critical-asset/',
        name: 'retried-critical-asset',
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
    ...brokenProviders,
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
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
    // Test assets are added to the SSR html through `resourcesRegistry`, not created on the
    // client with `document.createElement`. This is essential: a synchronous tag from the
    // markup blocks the `load` event, and this is exactly the order in which events arrive in
    // production. Assets added dynamically on the client do not block `load`, so real event
    // ordering problems are not reproducible with them.
    provide({
      provide: commandLineListTokens.generatePage,
      useFactory: ({ router, resourcesRegistry }) => {
        return () => {
          const route = router.getCurrentRoute();

          if (route.actualPath === '/simple-with-error/') {
            resourcesRegistry.register({
              type: ResourceType.script,
              slot: ResourceSlot.HEAD_CORE_SCRIPTS,
              payload: 'http://localhost/non-existent.js',
              attrs: { 'data-critical': 'true' },
            });
          }
          // critical CSS failure - `link` tags go through a different retry branch than scripts
          if (route.actualPath === '/failed-critical-css/') {
            resourcesRegistry.register({
              type: ResourceType.style,
              slot: ResourceSlot.HEAD_CORE_STYLES,
              payload: 'http://localhost/non-existent.css',
              attrs: { 'data-critical': 'true' },
            });
          }
          // asset without `data-critical`/`data-webpack` must NOT affect the page-level verdict
          if (route.actualPath === '/failed-non-critical-asset/') {
            resourcesRegistry.register({
              type: ResourceType.script,
              slot: ResourceSlot.HEAD_CORE_SCRIPTS,
              payload: 'http://localhost/non-existent-non-critical.js',
              attrs: {},
            });
          }
          // critical asset on the app's own origin, so a test can serve it as failing on the
          // first request and succeeding on the retry. `RETRY_HOSTNAME_MAP` is not set for this
          // app, so `getRetryUrl` returns the original url and the retry hits the same address.
          if (route.actualPath === '/retried-critical-asset/') {
            resourcesRegistry.register({
              type: ResourceType.script,
              slot: ResourceSlot.HEAD_CORE_SCRIPTS,
              payload: '/retried-critical-asset.js',
              attrs: { 'data-critical': 'true' },
            });
          }
        };
      },
      deps: {
        router: ROUTER_TOKEN,
        resourcesRegistry: RESOURCES_REGISTRY,
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

            send(eventName: string, payload?: { [x: string]: any }) {
              // keep the legacy boolean flags, some tests rely on them
              (window as any)[eventName] = true;

              // full event log, allows to assert payloads, ordering and the number of
              // events sent for the same name (e.g. one `asset-load-failed` per asset)
              (window as any).__monitoringEvents = (window as any).__monitoringEvents || [];
              (window as any).__monitoringEvents.push({
                eventName,
                // `error` is not serializable, so save only the fields used by monitoring
                error: payload?.error
                  ? {
                      message: payload.error.message,
                      code: payload.error.code,
                      retry: payload.error.retry,
                      originalUrl: payload.error.originalUrl,
                      newUrl: payload.error.newUrl,
                      appCreationError: payload.error.appCreationError,
                    }
                  : undefined,
                urls: payload?.urls,
              });
            }
          }

          return new TramvaiInlineReporterImpl(inlineReporterParameters);
        };
      },
      deps: {},
    }),
  ],
});
