import { createToken } from '@tinkoff/dippy';
import type { CacheMethod } from './cache';

/**
 * @description
 * Handlers for server cache metrics
 */
export const CACHE_METRICS_SERVER_TOKEN =
  createToken<CacheServerMetricsHandlers>('cacheMetricsServer');

export type CacheServerMetricsHandlers = {
  onHit(name: string, method: CacheMethod): void;
  onMiss(name: string, method: CacheMethod): void;
  onMax(name: string, size: number): void;
  onSize(name: string, size: number): void;
};
