import LRU from '@tinkoff/lru-cache-nano';
import LFU from '@akashbabu/lfu-cache';
import type { CacheFactory } from '@tramvai/tokens-common';

class LFUToCacheAdapter extends LFU<any> {
  set(key: string, value: any, options?: { ttl: number }): any {
    return this.set(key, value);
  }

  has(key: string) {
    return typeof this.get(key) !== 'undefined';
  }

  dump(): Array<[string, { value: any }]> {
    const arr: Array<[string, { value: any }]> = [];

    this.forEach(([key, value]) => arr.push([key, { value }]));

    return arr;
  }

  load(arr: Array<[string, { value: any }]>) {
    arr.forEach(([key, { value }]) => {
      this.set(key, value);
    });
  }
}

export const cacheFactory: CacheFactory = (type?, options = { max: 100 }) => {
  if (type === 'memory-lfu') {
    if (typeof options === 'object' && 'ttl' in options) {
      // ttl option is not supported by @akashbabu/lfu-cache
      // eslint-disable-next-line no-param-reassign
      options.maxAge = options.ttl;
    }
    return new LFUToCacheAdapter(options);
  }
  return new LRU(options);
};
