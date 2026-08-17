import {
  ExtractDependencyType,
  commandLineListTokens,
  createApp,
  optional,
  provide,
} from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import { PageRenderModeModule } from '@tramvai/module-page-render-mode';
import {
  PWA_PREFIX_TREE,
  PWA_RESOLVE_TOKEN,
  PWA_WORKBOX_TOKEN,
  TramvaiPwaModule,
  createSelectActivePwaConfig,
} from '@tramvai/module-progressive-web-app';
import { DEFAULT_HEADER_COMPONENT } from '@tramvai/tokens-render';

import { Header } from './components/features/Header/Header';

import './app.module.css';

createApp({
  name: 'pwa',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    ErrorInterceptorModule,
    PageRenderModeModule,
    TramvaiPwaModule,
  ],
  providers: [
    provide({
      provide: PWA_RESOLVE_TOKEN,
      useFactory: ({ prefixTree }) => {
        return ((pwaConfigs, currentPath) => {
          // Your custom logic
          if (/custom/.test(currentPath)) {
            return undefined;
          }

          const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);

          // Fallback to the default implementation
          return selectActivePwaConfig(pwaConfigs, currentPath);
        }) satisfies ExtractDependencyType<typeof PWA_RESOLVE_TOKEN>;
      },
      deps: {
        prefixTree: PWA_PREFIX_TREE,
      },
    }),
    provide({
      provide: DEFAULT_HEADER_COMPONENT,
      useValue: Header,
    }),
    ...(typeof window !== 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.listen,
            useFactory: ({ workbox }) => {
              return async function sendMessageToSW() {
                const wb = await workbox?.();

                // wb can be `null` if Service Worker is not supported or registration failed
                const swVersion = await wb?.messageSW({ type: 'GET_VERSION' });

                // eslint-disable-next-line no-console
                console.log('Service Worker version:', swVersion);
              };
            },
            deps: {
              workbox: optional(PWA_WORKBOX_TOKEN),
            },
          }),
        ]
      : []),
  ],
});
