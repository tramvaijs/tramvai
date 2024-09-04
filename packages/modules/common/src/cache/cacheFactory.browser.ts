import LRU from '@tinkoff/lru-cache-nano';
import type { CacheOptions, CacheType } from '@tramvai/tokens-common';

export function getCacheFactory() {
  return function cacheFactory<T>(
    cacheType: CacheType = 'memory',
    options: CacheOptions<typeof cacheType>
  ) {
    return new LRU<string, T>(options);
  };
}
