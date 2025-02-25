import type { Cache, CacheServerMetricsHandlers } from '@tramvai/tokens-common';
import { CacheWithMetricsProxy } from './cacheWithMetricsProxy';

const TEST_CACHE_NAME = 'test-cache';

const cacheMock = {
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  dump: jest.fn(),
  load: jest.fn(),
  peek: jest.fn(),
  size: 1,
  // eslint-disable-next-line prettier/prettier
} satisfies Cache;

const cacheMetrics = {
  onHit: jest.fn(),
  onMiss: jest.fn(),
  onMax: jest.fn(),
  onSize: jest.fn(),
} satisfies CacheServerMetricsHandlers;

describe('@tramvai/module-common cache with metrics limited by size', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should store max size in metrics on cache creation', () => {
    const cacheWithMetricsProxy = new CacheWithMetricsProxy(
      cacheMock,
      { name: TEST_CACHE_NAME, max: 10, type: 'memory' },
      cacheMetrics
    );

    expect(cacheMetrics.onMax).toHaveBeenCalledWith('test-cache', 10);
  });
});

describe('@tramvai/module-common cache with metrics proxy class handlers', () => {
  const cacheWithMetricsProxy = new CacheWithMetricsProxy(
    cacheMock,
    { name: TEST_CACHE_NAME, max: 10, type: 'memory' },
    cacheMetrics
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call onHit and onSize, on cache hit for method "get"', () => {
    cacheMock.get.mockImplementation(() => 'value');

    const value = cacheWithMetricsProxy.get('');
    expect(value).toBe('value');

    expect(cacheMetrics.onHit).toHaveBeenCalledWith(TEST_CACHE_NAME, 'get');
    expect(cacheMetrics.onMiss).not.toHaveBeenCalled();
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).toHaveBeenCalled();
  });

  it('should call onMiss and onSize, on cache miss for method "get"', () => {
    cacheMock.get.mockImplementation(() => undefined);

    const value = cacheWithMetricsProxy.get('');
    expect(value).toBeUndefined();

    expect(cacheMetrics.onHit).not.toHaveBeenCalled();
    expect(cacheMetrics.onMiss).toHaveBeenCalledWith(TEST_CACHE_NAME, 'get');
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).toHaveBeenCalled();
  });

  it('should call onHit, on cache hit for method "peek"', () => {
    cacheMock.peek.mockImplementation(() => 'value');

    const value = cacheWithMetricsProxy.peek('');
    expect(value).toBe('value');

    expect(cacheMetrics.onHit).toHaveBeenCalledWith(TEST_CACHE_NAME, 'peek');
    expect(cacheMetrics.onMiss).not.toHaveBeenCalled();
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).not.toHaveBeenCalled();
  });

  it('should call onMiss, on cache miss for method "peek"', () => {
    cacheMock.peek.mockImplementation(() => undefined);

    const value = cacheWithMetricsProxy.peek('');
    expect(value).toBeUndefined();

    expect(cacheMetrics.onHit).not.toHaveBeenCalled();
    expect(cacheMetrics.onMiss).toHaveBeenCalledWith(TEST_CACHE_NAME, 'peek');
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).not.toHaveBeenCalled();
  });

  it('should call onHit, on cache hit for method "has"', () => {
    cacheMock.has.mockImplementation(() => true);

    const value = cacheWithMetricsProxy.has('');
    expect(value).toBe(true);

    expect(cacheMetrics.onHit).toHaveBeenCalledWith(TEST_CACHE_NAME, 'has');
    expect(cacheMetrics.onMiss).not.toHaveBeenCalled();
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).not.toHaveBeenCalled();
  });

  it('should call onMiss and onSize, on cache miss for method "has"', () => {
    cacheMock.has.mockImplementation(() => false);

    const value = cacheWithMetricsProxy.has('');
    expect(value).toBe(false);

    expect(cacheMetrics.onHit).not.toHaveBeenCalled();
    expect(cacheMetrics.onMiss).toHaveBeenCalledWith(TEST_CACHE_NAME, 'has');
    expect(cacheMetrics.onMax).not.toHaveBeenCalled();
    expect(cacheMetrics.onSize).not.toHaveBeenCalled();
  });

  it('should call onSize with size argument for methods: "get", "set", "delete", "clear", "load"', () => {
    cacheMock.size = 1;
    cacheWithMetricsProxy.get('');
    expect(cacheMetrics.onSize).toHaveBeenNthCalledWith(1, TEST_CACHE_NAME, 1);

    cacheMock.size = 2;
    cacheWithMetricsProxy.set('', '');
    expect(cacheMetrics.onSize).toHaveBeenNthCalledWith(2, TEST_CACHE_NAME, 2);

    cacheMock.size = 3;
    cacheWithMetricsProxy.delete('');
    expect(cacheMetrics.onSize).toHaveBeenNthCalledWith(3, TEST_CACHE_NAME, 3);

    cacheMock.size = 4;
    cacheWithMetricsProxy.clear();
    expect(cacheMetrics.onSize).toHaveBeenNthCalledWith(4, TEST_CACHE_NAME, 4);

    cacheMock.size = 5;
    cacheWithMetricsProxy.load([]);
    expect(cacheMetrics.onSize).toHaveBeenNthCalledWith(5, TEST_CACHE_NAME, 5);
  });
});
