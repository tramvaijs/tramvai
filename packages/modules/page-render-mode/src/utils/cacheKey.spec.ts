import { getCacheKey, parseCacheKey } from './cacheKey';

describe('cacheKey', () => {
  it('getCacheKey', () => {
    expect(
      getCacheKey({
        method: 'GET',
        host: 'localhost',
        path: '/test',
        deviceType: 'desktop',
      })
    ).toBe('GET=localhost=/test=desktop');

    expect(
      getCacheKey({
        method: 'GET',
        host: 'localhost',
        path: '/test',
        deviceType: 'mobile',
      })
    ).toBe('GET=localhost=/test=mobile');
  });

  it('parseCacheKey', () => {
    const key1 = getCacheKey({
      method: 'GET',
      host: 'localhost',
      path: '/test',
      deviceType: 'desktop',
    });

    expect(parseCacheKey(key1)).toEqual(['GET', 'localhost', '/test', 'desktop']);

    const key2 = getCacheKey({
      method: 'GET',
      host: 'localhost',
      path: '/test',
      deviceType: 'mobile',
    });

    expect(parseCacheKey(key2)).toEqual(['GET', 'localhost', '/test', 'mobile']);
  });
});
