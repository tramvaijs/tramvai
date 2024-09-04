import { testModule } from '@tramvai/test-unit';
import { CREATE_CACHE_TOKEN } from '@tramvai/tokens-common';
import { CacheModule } from './CacheModule';

const KEY = 'key';
const VALUE = 'value';
const NAME = 'name';

describe('module-common/cache', () => {
  it('should create memory cache (@tinkoff/lru-cache-nano)', () => {
    const { di } = testModule(CacheModule);
    const cacheFactory = di.get(CREATE_CACHE_TOKEN);
    const cache = cacheFactory('memory');
    cache.set(KEY, VALUE);

    expect(cache.get(KEY)).toBe(VALUE);
  });

  it('should create memory-lfu cache (@akashbabu/lfu-cache)', () => {
    const { di } = testModule(CacheModule);
    const cacheFactory = di.get(CREATE_CACHE_TOKEN);
    const cache = cacheFactory('memory-lfu');
    cache.set(KEY, VALUE);

    expect(cache.get(KEY)).toBe(VALUE);
  });

  it('should throw on multiple caches with same name', () => {
    const { di } = testModule(CacheModule);
    const cacheFactory = di.get(CREATE_CACHE_TOKEN);
    cacheFactory('memory', { name: NAME });

    expect(() => cacheFactory('memory', { name: NAME })).toThrow();
  });
});
