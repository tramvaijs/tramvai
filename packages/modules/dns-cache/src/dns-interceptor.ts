import { interceptors } from 'undici';
import dns from 'dns';

import type Interceptors from 'undici/types/interceptors';
import type LRUCache from '@tinkoff/lru-cache-nano';
import { CacheInstance } from 'cacheable-lookup';

import { createToken } from '@tramvai/core';

// in seconds
const getDuration = (current: number, prev: number) =>
  // max to avoid negative values and turn that into zero
  prev === 0 ? 0 : Math.max((current - prev) / 1000, 0);

export type UndiciDnsCacheStorage = Required<Interceptors.DNSInterceptorOpts>['storage'];

export const DNS_CACHEABLE_LOOKUP_CACHE_TOKEN =
  createToken<CacheInstance>('dnsCacheableLookupCache');
export const DNS_UNDICI_LOOKUP_CACHE_TOKEN =
  createToken<UndiciDnsCacheStorage>('dnsUndiciLookupCache');

export const createDnsInterceptor = ({
  maxTTL,
  maxItems,
  dualStack,
  affinity,
  storage,
  ipHostCache,
  onLookupEnd,
}: {
  maxTTL: number;
  maxItems: number;
  dualStack?: boolean;
  affinity?: 4 | 6;
  storage: UndiciDnsCacheStorage;
  ipHostCache: LRUCache<string, string> | null;
  onLookupEnd: (hostname: string, lookupDuration: number) => void;
}) =>
  interceptors.dns({
    maxTTL,
    maxItems,
    dualStack,
    affinity,
    // https://github.com/nodejs/undici/pull/4589
    storage,
    // undici captures dns.lookup at import time via destructuring,
    // so runtime patches to dns.lookup (e.g. from cacheable-lookup or test mocks) are invisible.
    // Providing a custom lookup that reads dns.lookup from the module object at call time fixes this.
    // https://github.com/nodejs/undici/blob/e1f9035d0fdc26db66d8501134ae15e5dab15488/lib/interceptor/dns.js#L241
    lookup: (origin: URL, opts: any, cb: any) => {
      const lookupStart = Date.now();
      const { hostname } = origin;

      dns.lookup(
        hostname,
        {
          all: true,
          family: opts.dualStack === false ? opts.affinity : 0,
          order: 'ipv4first',
        },
        (err: any, addresses: any) => {
          const lookupEnd = Date.now();
          onLookupEnd(hostname, getDuration(lookupEnd, lookupStart));

          if (err) {
            return cb(err);
          }

          const results = new Map();

          for (const addr of addresses) {
            results.set(`${addr.address}:${addr.family}`, addr);

            if (ipHostCache) {
              ipHostCache.set(addr.address, origin.hostname);
            }
          }

          cb(null, results.values());
        }
      );
    },
  });
