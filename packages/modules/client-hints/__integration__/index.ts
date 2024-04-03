import { commandLineListTokens, createApp, createBundle, provide } from '@tramvai/core';
import { ClientHintsCSRModule } from '@tramvai/module-client-hints';
import { ROUTES_TOKEN } from '@tramvai/tokens-router';
import { lazy } from '@tramvai/react';
import { modules } from '../../../../test/shared/common';

const bundle = createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: lazy(() => import('./page-default')),
    pageHydrationError: lazy(() => import('./page-hydration-error')),
  },
});

createApp({
  name: 'client-hints',
  modules: [...modules, ClientHintsCSRModule],
  providers: [
    provide({
      provide: ROUTES_TOKEN,
      useValue: [
        {
          name: 'main',
          path: '/',
        },
        {
          name: 'hydration-error',
          path: '/hydration-error/',
          config: {
            pageComponent: 'pageHydrationError',
          },
        },
      ],
    }),
    ...(typeof window !== 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.customerStart,
            useFactory: () => {
              return function enableHydrationLogs() {
                (window as any).logger.enable('module-render:hydrate:recover-after-error');
              };
            },
          }),
        ]
      : []),
  ],
  bundles: {
    mainDefault: () => Promise.resolve({ default: bundle }),
  },
});
