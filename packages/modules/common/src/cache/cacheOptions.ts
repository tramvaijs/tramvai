import type { CacheFactoryOptions, CacheOptions, CacheType } from '@tramvai/tokens-common';

const CACHE_MAX_DEFAULT = 100;

export function getCacheOptions(
  cacheType: CacheType,
  options?: CacheFactoryOptions<typeof cacheType>
): CacheOptions<typeof cacheType> {
  return {
    type: cacheType,
    max: CACHE_MAX_DEFAULT,
    ...options,
  };
}
