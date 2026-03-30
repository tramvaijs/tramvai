import {
  commandLineListTokens,
  createApp,
  createBundle,
  provide,
  TRAMVAI_HOOKS_TOKEN,
} from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
import { ERROR_BOUNDARY_TOKEN } from '@tramvai/react';
import { ServerModule } from '@tramvai/module-server';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { TramvaiPwaLightModule } from '@tramvai/module-progressive-web-app';
import { SpaRouterModule } from '@tramvai/module-router';

import {
  ApplicationMonitoringModule,
  INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
  TramvaiInlineReporter,
  InlineReporterParameters,
} from '@tramvai/module-application-monitoring';
import { COMBINE_REDUCERS } from '@tramvai/module-common';

import Page from './page';

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
    ]),
  ],
  bundles: {
    mainDefault: () =>
      Promise.resolve({
        default: createBundle({
          name: 'mainDefault',
          components: {
            pageDefault: Page,
          },
        }),
      }),
  },
  providers: [
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [],
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
      useFactory: ({ hooks }) => {
        return () => {
          hooks['app:initialized'].tap('app-init', () => {
            if (typeof window !== 'undefined') {
              (window as any).appInit = true;
            }
          });
          hooks['app:initialize-failed'].tap('app-init-failed', () => {
            if (typeof window !== 'undefined') {
              (window as any).appInitFailed = true;
            }
          });
          hooks['app:rendered'].tap('app-rendered', () => {
            if (typeof window !== 'undefined') {
              (window as any).appRendered = true;
            }
          });
          hooks['app:render-failed'].tap('app-render-failed', () => {
            if (typeof window !== 'undefined') {
              (window as any).appRenderFailed = true;
            }
          });

          hooks['react:error'].tap('react-error', () => {
            if (typeof window !== 'undefined') {
              (window as any).reactError = true;
            }
          });
        };
      },
      deps: {
        hooks: TRAMVAI_HOOKS_TOKEN,
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
