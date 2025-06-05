import type { Cache } from '@tramvai/tokens-common';
import { cleanupStaleElementsInCache } from './cacheCleanup';

const createCacheFactory = (ttl: number) => {
  const cache: Record<string, any> = {};
  const ttls: number[] = [];
  return {
    ttls: [],
    get(key: string) {
      return cache[key];
    },
    set(key: string, value: any, options: { ttl?: number }) {
      if (options?.ttl) {
        const index = Object.values(cache).length;
        ttls[index] = options?.ttl;
      }
      cache[key] = value;
    },
    delete(key: string) {
      return delete cache[key];
    },
    dump() {
      return Object.keys(cache).map((key, index) => {
        return [
          key,
          {
            value: cache[key],
            ttl: ttls[index] ?? ttl,
            start: 0,
          },
        ];
      });
    },
  } as unknown as Cache;
};

const date = jest.spyOn(Date, 'now');
const perf = jest.spyOn(performance, 'now');

describe('cache-cleanup', () => {
  beforeEach(() => {
    date.mockReturnValue(0);
    perf.mockReturnValue(0);
  });

  it('should not delete relevant entries', async () => {
    const cache = createCacheFactory(1000);
    const key = 'key';
    const value = 'value';

    cache.set(key, value);

    cleanupStaleElementsInCache(cache);

    expect(cache.get(key)).toBe(value);
  });

  it('should delete stale entries', async () => {
    const cache = createCacheFactory(1000);
    const key = 'key';
    const otherKey = 'other-key';
    const value = 'value';

    cache.set(key, value, { ttl: 1000 });

    cache.set(otherKey, value, { ttl: 1002 });

    date.mockReturnValue(1001);
    cleanupStaleElementsInCache(cache);

    expect(cache.get(key)).toBeUndefined();
    expect(cache.get(otherKey)).toBe(value);
  });
});
