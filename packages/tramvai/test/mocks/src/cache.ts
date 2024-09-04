import type { Cache } from '@tramvai/tokens-common';

export const createMockCache = <T = any>(entries: Record<string, T> = {}): Cache => {
  let cache = { ...entries };
  return {
    has: (key: string) => !!cache[key],
    get: (key: string) => cache[key],
    peek: (key: string) => cache[key],
    set: (key: string, value: T) => {
      cache[key] = value;
    },
    clear: () => {
      cache = {};
    },
    delete: (key: string) => delete cache[key],
    load: (values: Array<[string, { value: T }]>) =>
      values.forEach(([key, { value }]) => (cache[key] = value)),
    dump: () => Object.entries(cache).map(([key, value]) => [key, { value }]),
    size: Object.keys(cache).length,
  };
};
