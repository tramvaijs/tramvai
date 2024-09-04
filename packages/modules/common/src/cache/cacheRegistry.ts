import type {
  Cache,
  CacheType,
  CacheFactory,
  CacheFactoryOptions,
  CacheServerMetricsHandlers,
} from '@tramvai/tokens-common';
import { getCacheOptions } from './cacheOptions';
import { getCacheFactory } from './cacheFactory';

export function cacheRegistry({
  caches,
  cacheNames,
  metrics,
}: {
  caches: Cache[];
  cacheNames: Set<string> | null;
  metrics: CacheServerMetricsHandlers | null;
}): CacheFactory {
  return function <T>(
    cacheType: CacheType = 'memory',
    options?: CacheFactoryOptions<typeof cacheType>
  ): Cache<T> {
    const extendedOptions = getCacheOptions(cacheType, options);
    const factory = getCacheFactory({ cacheNames, metrics });
    const cache = factory<T>(cacheType, extendedOptions);
    caches.push(cache);

    return cache;
  };
}
