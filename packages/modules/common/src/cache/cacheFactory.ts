import LRU from '@tinkoff/lru-cache-nano';
import LFU from '@akashbabu/lfu-cache';
import { MEMORY_LRU } from '@tramvai/tokens-common';
import type {
  CacheOptions,
  MEMORY_LFU,
  Cache,
  CacheServerMetricsHandlers,
  CacheType,
} from '@tramvai/tokens-common';
import { isMemoryLRU, isMemoryLFU } from './cacheType';
import { CacheWithMetricsProxy } from './cacheWithMetricsProxy';

class LFUToCacheAdapter extends LFU<any> {
  has(key: string): boolean {
    return typeof super.get(key) !== 'undefined';
  }

  dump(): Array<[string, { value: any }]> {
    const arr: Array<[string, { value: any }]> = [];
    super.forEach(([key, value]) => arr.push([key, { value }]));
    return arr;
  }

  load(arr: Array<[string, { value: any }]>): void {
    arr.forEach(([key, { value }]) => {
      super.set(key, value);
    });
  }
}

function cacheFactoryMemoryLRU<T>({ type, ...options }: CacheOptions<typeof MEMORY_LRU>): Cache<T> {
  return new LRU(options);
}

function cacheFactoryMemoryLFU<T>({ type, ...options }: CacheOptions<typeof MEMORY_LFU>): Cache<T> {
  if (options && 'ttl' in options && typeof options.ttl === 'number') {
    // ttl option is not supported by @akashbabu/lfu-cache
    // eslint-disable-next-line no-param-reassign
    options.maxAge = options.ttl;
  }

  return new LFUToCacheAdapter(options);
}

function cacheFactory<T>(
  cacheType: CacheType = MEMORY_LRU,
  options: CacheOptions<typeof cacheType>
): Cache<T> {
  let cache: Cache<T> | undefined;

  if (isMemoryLFU(options)) {
    cache = cacheFactoryMemoryLFU(options);
  }

  if (isMemoryLRU(options)) {
    cache = cacheFactoryMemoryLRU(options);
  }

  if (!cache) {
    throw new Error(`Cache type ${cacheType} doesn't implemented yet`);
  }

  return cache;
}

function getUniqueName(name: string, cacheNames: Set<string>): string {
  if (!cacheNames.has(name)) {
    return name;
  }

  const baseName = `${name}-unsafe-copy`;
  let index = 1;

  while (cacheNames.has(`${baseName}-${index}`)) {
    index += 1;
  }

  return `${baseName}-${index}`;
}

export function getCacheFactory({
  cacheNames,
  metrics,
}: {
  cacheNames: Set<string> | null;
  metrics: CacheServerMetricsHandlers | null;
}) {
  return function <T>(cacheType: CacheType, options: CacheOptions<typeof cacheType>): Cache<T> {
    const cache = cacheFactory<T>(cacheType, options);

    if (!options?.name || cacheNames === null) {
      return cache;
    }

    if (cacheNames.has(options.name)) {
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Cache with name ${options.name} is already created`);
      }

      options.name = getUniqueName(options.name, cacheNames);
    }

    cacheNames.add(options.name);

    return new CacheWithMetricsProxy(cache, options, metrics);
  };
}
