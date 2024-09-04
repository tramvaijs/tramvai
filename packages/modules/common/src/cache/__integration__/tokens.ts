import { createToken } from '@tinkoff/dippy';
import type { Cache } from '@tramvai/tokens-common';

export const CACHE_NAME_LRU = 'cache-name-lru';
export const CACHE_NAME_LFU = 'cache-name-lfu';

export type TestCacheName = typeof CACHE_NAME_LRU | typeof CACHE_NAME_LFU;
export type TestCacheDictionary = {
  [cacheName in TestCacheName]: Cache;
};

export const TEST_CACHES_TOKEN = createToken<TestCacheDictionary>('test caches');
