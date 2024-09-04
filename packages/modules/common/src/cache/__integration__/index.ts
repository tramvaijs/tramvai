import { Scope, createApp, createBundle, provide } from '@tramvai/core';
import { CREATE_CACHE_TOKEN, CommonModule, REQUEST_MANAGER_TOKEN } from '@tramvai/module-common';
import { ROUTES_TOKEN } from '@tramvai/module-router';
import { MetricsModule } from '@tramvai/module-metrics';
import { modules } from '@tramvai/internal-test-utils/shared/common';

import { CACHE_NAME_LFU, CACHE_NAME_LRU, TEST_CACHES_TOKEN } from './tokens';
import { Value, BrowserCache } from './components';
import { cacheCall } from './cacheCall';

createApp({
  name: 'cache',
  modules: [...modules, CommonModule, MetricsModule],
  providers: [
    provide({
      provide: TEST_CACHES_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ createCache }) => ({
        [CACHE_NAME_LRU]: createCache('memory', {
          name: CACHE_NAME_LRU,
          max: 5,
        }),
        [CACHE_NAME_LFU]: createCache('memory-lfu', {
          name: CACHE_NAME_LFU,
        }),
      }),
      deps: {
        createCache: CREATE_CACHE_TOKEN,
      },
    }),
    provide({
      provide: ROUTES_TOKEN,
      multi: true,
      useValue: [
        {
          config: {
            pageComponent: 'browserCache',
          },
          path: '/browser-cache/',
          name: 'browser-cache',
        },
      ],
    }),
    provide({
      provide: ROUTES_TOKEN,
      multi: true,
      useFactory: ({ caches, requestManager }) => {
        const url = requestManager.getParsedUrl();

        try {
          const result = cacheCall(caches, url);

          return [
            {
              config: {
                pageComponent: 'value',
                value: result,
              },
              path: '/*/',
              name: 'root-wildcard',
            },
          ];
        } catch {
          return [];
        }
      },
      deps: {
        caches: TEST_CACHES_TOKEN,
        requestManager: REQUEST_MANAGER_TOKEN,
      },
    }),
  ],
  bundles: {
    mainDefault: () =>
      Promise.resolve({
        default: createBundle({
          name: 'mainDefault',
          components: {
            value: Value,
            browserCache: BrowserCache,
          },
        }),
      }),
  },
});
