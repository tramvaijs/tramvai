import { getCacheKey, parseCacheKey } from './cacheKey';

describe('cacheKey', () => {
  it('getCacheKey', () => {
    expect(
      getCacheKey({
        pathname: '/test',
        key: '',
      })
    ).toBe('/test^');

    expect(
      getCacheKey({
        pathname: '/test',
        key: 'mobile',
      })
    ).toBe('/test^mobile');
  });

  it('parseCacheKey', () => {
    const key1 = getCacheKey({
      pathname: '/test',
      key: 'desktop',
    });

    expect(parseCacheKey(key1)).toEqual(['/test', 'desktop']);

    const key2 = getCacheKey({
      pathname: '/test',
      key: 'mobile',
    });

    expect(parseCacheKey(key2)).toEqual(['/test', 'mobile']);
  });
});
