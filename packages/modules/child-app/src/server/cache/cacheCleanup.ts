import { Cache } from '@tramvai/tokens-common';

export function cleanupStaleElementsInCache<T>(cache: Cache<T>) {
  const entries = cache.dump() as [string, { value: T; ttl: number; start: number }][];
  const now = Date.now();

  for (const [key, value] of entries) {
    if (value.start + value.ttl < now) {
      cache.delete(key);
    }
  }
}

export function setCacheCleanupInterval<T>(
  cache: Cache<T>,
  intervalMs: number = 1000 * 60 * 60 * 24
) {
  setInterval(() => {
    cleanupStaleElementsInCache(cache);
  }, intervalMs);
}
