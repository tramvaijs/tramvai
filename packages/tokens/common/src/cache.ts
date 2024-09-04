import { createToken } from '@tinkoff/dippy';
import type { CacheServerMetricsHandlers } from './cacheMetrics';

/**
 * @description
 * Function for creating a new cache
 *
 * *Note*: currently only memory cache with `@tinkoff/lru-cache-nano` is supported
 */
export const CREATE_CACHE_TOKEN = createToken<CacheFactory>('createCache');

/**
 * @description
 * Function that is called on force cache clean up in the app
 */
export const REGISTER_CLEAR_CACHE_TOKEN = createToken<(type?: CacheType) => void | Promise<void>>(
  'registerClearCache',
  { multi: true }
);

/**
 * @description
 * Force cleaning up all caches in the app
 */
export const CLEAR_CACHE_TOKEN =
  createToken<(type?: CacheType) => Promise<void | void[]>>('clearCache');

export interface Cache<T = any> {
  get(key: string): T | undefined;
  peek(key: string): T | undefined;
  set(key: string, value: T, options?: { ttl?: number }): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  dump(): Array<[string, { value: T }]>;
  load(arr: Array<[string, { value: T }]>): void;
  size: number;
}

export const MEMORY_LRU = 'memory';
export const MEMORY_LFU = 'memory-lfu';

export type CacheType = typeof MEMORY_LRU | typeof MEMORY_LFU;

// Only callable methods of cache type
export type CacheMethod = keyof {
  [M in keyof Cache as Cache[M] extends Function ? M : never]: any;
};

type CacheWithMetricsOptions = {
  /** Cache metrics label */
  name?: string;
};

type LRUOptions = {
  /**
   * The number of most recently used items to keep.
   * Note that we may store fewer items than this if maxSize is hit.
   */
  max?: number;

  /**
   * Max time to live for items before they are considered stale.
   * Note that stale items are NOT preemptively removed by default,
   * and MAY live in the cache, contributing to its LRU max, long after
   * they have expired.
   *
   * Also, as this cache is optimized for LRU/MRU operations, some of
   * the staleness/TTL checks will reduce performance, as they will incur
   * overhead by deleting items.
   *
   * Must be a positive integer in ms, defaults to 0, which means "no TTL"
   *
   * @default 0
   */
  ttl?: number;

  /**
   * Minimum amount of time in ms in which to check for staleness.
   * Defaults to 1, which means that the current time is checked
   * at most once per millisecond.
   *
   * Set to 0 to check the current time every time staleness is tested.
   *
   * Note that setting this to a higher value will improve performance
   * somewhat while using ttl tracking, albeit at the expense of keeping
   * stale items around a bit longer than intended.
   *
   * @default 1
   */
  ttlResolution?: number;

  /**
   * Return stale items from cache.get() before disposing of them
   *
   * @default false
   */
  allowStale?: boolean;

  /**
   * Update the age of items on cache.get(), renewing their TTL
   *
   * @default false
   */
  updateAgeOnGet?: boolean;
};

type LFUOptions = {
  /**
   * Specifies the maximum number item to accumulate in the cache. Defaults to 100
   */
  max?: number;
  /**
   * Specifies the number of items to be evicted once the cache is full.
   * If options.max is specified and options.evictCount is not specified,
   * then it defaults to 10% of options.max else it defaults to 1
   */
  evictCount?: number;
  /**
   * Maximum time upto which the keys would be retained in the cache even when unused.
   * Note that this time is in milliseconds(ms)
   */
  maxAge?: number;
};

export type CacheFactoryOptions<Type extends CacheType> = CacheWithMetricsOptions &
  (Type extends typeof MEMORY_LRU
    ? LRUOptions
    : Type extends typeof MEMORY_LFU
    ? LFUOptions
    : never);

export type CacheOptions<Type extends CacheType> = CacheFactoryOptions<Type> & {
  type: Type;
  max: number;
};

export type CacheFactory = <T, Type extends CacheType = typeof MEMORY_LRU>(
  cacheType?: Type,
  options?: CacheFactoryOptions<Type>,
  metrics?: CacheServerMetricsHandlers
) => Cache<T>;
