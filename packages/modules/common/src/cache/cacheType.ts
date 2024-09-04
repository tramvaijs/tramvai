import type { CacheOptions, CacheType } from '@tramvai/tokens-common';
import { MEMORY_LRU, MEMORY_LFU } from '@tramvai/tokens-common';

export function isMemoryLRU(
  options: CacheOptions<CacheType>
): options is CacheOptions<typeof MEMORY_LRU> {
  return options.type === MEMORY_LRU;
}

export function isMemoryLFU(
  options: CacheOptions<CacheType>
): options is CacheOptions<typeof MEMORY_LFU> {
  return options.type === MEMORY_LFU;
}
