import { provide } from '@tinkoff/dippy';
import { Module, Scope } from '@tramvai/core';
import type { Cache } from '@tramvai/tokens-common';
import {
  CACHE_METRICS_SERVER_TOKEN,
  CLEAR_CACHE_TOKEN,
  CREATE_CACHE_TOKEN,
  REGISTER_CLEAR_CACHE_TOKEN,
} from '@tramvai/tokens-common';
import { providers } from './serverProviders';
import { cacheRegistry } from './cacheRegistry';
import { CACHES_LIST_TOKEN, CACHE_NAMES_LIST_TOKEN } from './tokens';

@Module({
  providers: [
    ...providers,
    {
      provide: CACHES_LIST_TOKEN,
      scope: Scope.SINGLETON,
      useValue: [],
    },
    provide({
      provide: CREATE_CACHE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: cacheRegistry,
      deps: {
        caches: CACHES_LIST_TOKEN,
        cacheNames: {
          token: CACHE_NAMES_LIST_TOKEN,
          optional: true,
        },
        metrics: {
          token: CACHE_METRICS_SERVER_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: CLEAR_CACHE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ caches, onCacheClear }) => {
        return (type?) => {
          caches.forEach((cache: Cache) => cache.clear());

          if (onCacheClear) {
            return Promise.all(onCacheClear.map((clear) => clear(type)));
          }

          return Promise.resolve();
        };
      },
      deps: {
        caches: CACHES_LIST_TOKEN,
        onCacheClear: { token: REGISTER_CLEAR_CACHE_TOKEN, optional: true },
      },
    }),
  ],
})
export class CacheModule {}
