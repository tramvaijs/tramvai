import { testModule } from '@tramvai/test-unit';
import { CREATE_CACHE_TOKEN } from '@tramvai/tokens-common';
import { CacheModule } from './CacheModule';
import { CACHE_NAMES_LIST_TOKEN } from './tokens';

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

  it('should throw on multiple caches with same name in development environment', () => {
    const originEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { di } = testModule(CacheModule);
    const cacheFactory = di.get(CREATE_CACHE_TOKEN);
    cacheFactory('memory', { name: NAME });

    expect(() => cacheFactory('memory', { name: NAME })).toThrow();

    process.env.NODE_ENV = originEnv;
  });

  it('should create unsafe copies on multiple caches with same name in production environment', () => {
    const originEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { di } = testModule(CacheModule);
    const cacheFactory = di.get(CREATE_CACHE_TOKEN);
    cacheFactory('memory', { name: NAME });
    cacheFactory('memory', { name: NAME });
    cacheFactory('memory', { name: NAME });

    const cacheNames = di.get(CACHE_NAMES_LIST_TOKEN);

    expect(cacheNames.has('name')).toBeTruthy();
    expect(cacheNames.has('name-unsafe-copy-1')).toBeTruthy();
    expect(cacheNames.has('name-unsafe-copy-2')).toBeTruthy();

    process.env.NODE_ENV = originEnv;
  });
});
