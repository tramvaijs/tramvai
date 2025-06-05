import { commandLineListTokens, provide } from '@tramvai/core';
import { Scope, optional } from '@tinkoff/dippy';
import {
  CHILD_APP_LOADER_CACHE_TOKEN,
  CHILD_APP_LOADER_CACHE_CLEANUP_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import { ASYNC_LOCAL_STORAGE_TOKEN, Cache, CREATE_CACHE_TOKEN } from '@tramvai/tokens-common';
import { CHILD_APP_LOADER_CACHE_OPTIONS_TOKEN } from '@tramvai/tokens-child-app';

import { setCacheCleanupInterval } from './cacheCleanup';

export const cache = [
  provide({
    provide: commandLineListTokens.listen,
    useFactory: ({ childAppLoaderCache, cacheCleanupConfig }) => {
      return () => {
        setCacheCleanupInterval(childAppLoaderCache, cacheCleanupConfig?.cleanupIntervalMs);
      };
    },
    deps: {
      cacheCleanupConfig: optional(CHILD_APP_LOADER_CACHE_CLEANUP_CONFIG_TOKEN),
      childAppLoaderCache: CHILD_APP_LOADER_CACHE_TOKEN,
    },
  }),
  provide({
    provide: CHILD_APP_LOADER_CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ createCache, cacheOptions, asyncLocalStorage }) => {
      const inMemoryCache = createCache('memory', {
        name: 'child-app-loader',
        // When Child App script is evicted from server loader cache, we get a small memory leak,
        // because providers in singleton child DI, page components / actions, will store a reference to removed script,
        // and server loader cache will contain a new instance of the same script.
        //
        // So, it is better to have bigger cache size to prevent evicting from cache,
        // also for one Child App we need to save 3 elements - server JS, stats JSON and loadable stats JSON.

        max: 100,
        ttl: 1000 * 60 * 60 * 24 * 5,
        ...cacheOptions,
      });

      let childAppLoaderCache = inMemoryCache;

      // Cache is not compatible with HMR (Hot Module Replacement) because after HMR and page reload,
      // we get the page from the cache. To solve this, we use Async Local Storage to ensure the
      // cache is only valid within the context of a single request.
      if (process.env.NODE_ENV === 'development' && !!asyncLocalStorage) {
        childAppLoaderCache = {
          get(key: string) {
            if (key?.startsWith('__DEBUG__')) {
              const store = asyncLocalStorage.getStore() as { [key: string]: any } | undefined;
              if (store) {
                return store[key];
              }
            } else {
              return inMemoryCache.get(key);
            }
          },
          set(key: string, module: any) {
            if (key?.startsWith('__DEBUG__')) {
              const store = asyncLocalStorage.getStore() as { [key: string]: any } | undefined;
              if (store) {
                store[key] = module;
              }
            } else {
              inMemoryCache.set(key, module);
            }
          },
        } as Cache;
      }

      return childAppLoaderCache;
    },
    deps: {
      asyncLocalStorage: optional(ASYNC_LOCAL_STORAGE_TOKEN),
      cacheOptions: optional(CHILD_APP_LOADER_CACHE_OPTIONS_TOKEN),
      createCache: CREATE_CACHE_TOKEN,
    },
  }),
];
