import type { Cache } from '@tramvai/tokens-common';
import type { Url } from '@tinkoff/url';
import type { TestCacheDictionary, TestCacheName } from './tokens';

const knownMethods = {
  '/get/': 'get',
  '/set/': 'set',
  '/has/': 'has',
  '/clear/': 'clear',
} as const;

const unknownMethod = 'unknown';

type MethodName = typeof knownMethods[keyof typeof knownMethods] | typeof unknownMethod;

type MethodDictionary = {
  [method in MethodName]: (key?: string, value?: string | string[]) => void | boolean | string;
};

function getMethod(url: Url): MethodName {
  const { pathname } = url;

  if (!pathname) {
    return unknownMethod;
  }

  const methodPart = pathname.slice(pathname.indexOf('/', 1));
  const method = knownMethods[methodPart as keyof typeof knownMethods];

  if (!method) {
    return unknownMethod;
  }

  return method;
}

function getEntries(url: Url): Array<[string, string | string[] | undefined]> {
  if (!url.query) {
    return [];
  }

  if (typeof url.query === 'string') {
    return [[url.query, 'undefined']];
  }

  return Object.entries(url.query);
}

function getCache(caches: TestCacheDictionary, url: Url): Cache {
  const { pathname } = url;
  const cacheName = pathname.slice(1, pathname.indexOf('/', 1));

  const cache = caches[cacheName as TestCacheName];

  if (!cache) {
    throw new Error(`There is no ${cacheName} in test application`);
  }

  return cache;
}

/**
 * Parse url for cache name and method then call it
 *
 * @example
 * url: /cache-name-lru/set/?key=value&key2=value2
 * cache, { pathname: '/cache-name-lru/set/', query: { key: 'value', key2: 'value2' } }
 * will call `cache.set('key', 'value')`, then `cache.set('key2', 'value2')`
 * (on cache `cache-name-lru`)
 *
 * @example
 * url: /cache-name-lru/set/
 * cache, { pathname: '/cache-name-lru/set/', query: {} }
 * will call `cache.set('undefined', undefined)`
 */
export function cacheCall(caches: TestCacheDictionary, url: Url): Array<string | boolean | void> {
  const method = getMethod(url);
  const entries = getEntries(url);
  const cache = getCache(caches, url);

  const methods: MethodDictionary = {
    get: (key) => cache.get(String(key)),
    set: (key, value) => cache.set(String(key), value),
    has: (key) => cache.has(String(key)),
    clear: () => cache.clear(),
    unknown: () => {},
  };

  if (entries.length === 0) {
    return [methods[method]()];
  }

  return entries.map((entry) => methods[method](...entry));
}
