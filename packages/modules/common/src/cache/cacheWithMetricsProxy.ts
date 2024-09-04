import type {
  Cache,
  CacheMethod,
  CacheOptions,
  CacheServerMetricsHandlers,
  CacheType,
} from '@tramvai/tokens-common';

export class CacheWithMetricsProxy<T> implements Cache<T> {
  constructor(
    private cache: Cache,
    private options: CacheOptions<CacheType> | undefined,
    private metrics: CacheServerMetricsHandlers | null
  ) {
    if (
      this.options &&
      this.options.name &&
      'max' in this.options &&
      typeof this.options.max === 'number'
    ) {
      this.metrics?.onMax(this.options.name, this.options.max);
    }
  }

  private handleAccess(_key: string, value: T | boolean, method: CacheMethod): void {
    if (!this.options?.name) {
      return;
    }

    if (value) {
      this.metrics?.onHit(this.options.name, method);
    } else {
      this.metrics?.onMiss(this.options.name, method);
    }
  }

  private syncSize(): void {
    if (!this.options?.name) {
      return;
    }

    this.metrics?.onSize(this.options.name, this.cache.size);
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    this.handleAccess(key, value, 'get');
    this.syncSize();
    return value;
  }

  peek(key: string): T | undefined {
    const value = this.cache.peek(key);
    this.handleAccess(key, value, 'peek');
    return value;
  }

  has(key: string): boolean {
    const value = this.cache.has(key);
    this.handleAccess(key, value, 'has');
    return value;
  }

  set(key: string, value: T, options?: { ttl?: number }): void {
    this.cache.set(key, value, options);
    this.syncSize();
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.syncSize();
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.syncSize();
  }

  dump(): Array<[string, { value: T }]> {
    return this.cache.dump();
  }

  load(entries: Array<[string, { value: T }]>): void {
    this.cache.load(entries);
    this.syncSize();
  }

  get size(): number {
    return this.cache.size;
  }
}
