import noop from '@tinkoff/utils/function/noop';
import http from 'http';
import https from 'https';
import dns from 'dns';
import { interceptors } from 'undici';
import type Interceptors from 'undici/types/interceptors';
import type { CacheInstance } from 'cacheable-lookup';
import CacheableLookup from 'cacheable-lookup';
import { declareModule, provide, commandLineListTokens, Scope, createToken } from '@tramvai/core';
import {
  DEFAULT_HTTP_CLIENT_INTERCEPTORS,
  HTTP_CLIENT_AGENT_INTERCEPTORS,
} from '@tramvai/tokens-http-client';
import { CREATE_CACHE_TOKEN, ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/tokens-common';

type UndiciDnsCacheStorage = Required<Interceptors.DNSInterceptorOpts>['storage'];

const DNS_CACHEABLE_LOOKUP_CACHE_TOKEN = createToken<CacheInstance>('dnsCacheableLookupCache');
const DNS_UNDICI_LOOKUP_CACHE_TOKEN = createToken<UndiciDnsCacheStorage>('dnsUndiciLookupCache');

export const TramvaiDnsCacheModule = declareModule({
  name: 'TramvaiDnsCacheModule',
  imports: [],
  providers: [
    provide({
      provide: HTTP_CLIENT_AGENT_INTERCEPTORS,
      useFactory: ({ envManager, storage }) => {
        const dnsLookupEnabled = envManager.get('DNS_LOOKUP_CACHE_ENABLE') === 'true';
        const maxTTL = Number(envManager.get('DNS_LOOKUP_CACHE_TTL'));
        const maxItems = Number(envManager.get('DNS_LOOKUP_CACHE_LIMIT'));

        if (!dnsLookupEnabled) {
          return function noopInterceptor(dispatch) {
            return function noopInterceptorDispatch(opts, handler) {
              return dispatch(opts, handler);
            };
          };
        }

        const dnsInterceptor = interceptors.dns({
          maxTTL,
          maxItems,
          // https://github.com/nodejs/undici/pull/4589
          storage,
          // undici captures dns.lookup at import time via destructuring,
          // so runtime patches to dns.lookup (e.g. from cacheable-lookup or test mocks) are invisible.
          // Providing a custom lookup that reads dns.lookup from the module object at call time fixes this.
          // https://github.com/nodejs/undici/blob/e1f9035d0fdc26db66d8501134ae15e5dab15488/lib/interceptor/dns.js#L241
          lookup: (origin: URL, opts: any, cb: any) => {
            dns.lookup(
              origin.hostname,
              {
                all: true,
                family: opts.dualStack === false ? opts.affinity : 0,
                order: 'ipv4first',
              },
              (err: any, addresses: any) => {
                if (err) {
                  return cb(err);
                }

                const results = new Map();

                for (const addr of addresses) {
                  results.set(`${addr.address}:${addr.family}`, addr);
                }

                cb(null, results.values());
              }
            );
          },
        });

        (dnsInterceptor as any).__tramvai_dns_interceptor = true;

        return dnsInterceptor;
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
        storage: DNS_UNDICI_LOOKUP_CACHE_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: ({ envManager, cache }) => {
        if (envManager.get('DNS_LOOKUP_CACHE_ENABLE') !== 'true') {
          return noop;
        }
        return function addDnsLookupCache() {
          const maxTtl = Number(envManager.get('DNS_LOOKUP_CACHE_TTL'));
          const cacheable = new CacheableLookup({
            cache,
            maxTtl,
            // cacheable-lookup captures dns.lookup at import time via destructuring,
            // so runtime patches to dns.lookup are invisible.
            // Passing dns.lookup from the module object at construction time fixes this.
            // https://github.com/szmarczak/cacheable-lookup/blob/9e60c9f6e74a003692aec68f3ddad93afe613b8f/source/index.mjs#L6
            lookup: dns.lookup,
          });

          const originalLookup = cacheable.lookup;

          // workaround for https://github.com/szmarczak/cacheable-lookup/issues/68,
          // use original dns.lookup for localhost because cacheable-lookup doesn't handle `ESERVFAIL` error when resolving ipv6
          // @ts-expect-error
          cacheable.lookup = (hostname: any, options: any, callback: any) => {
            if (hostname === 'localhost') {
              return dns.lookup(hostname, options, callback);
            }
            originalLookup.call(cacheable, hostname, options, callback);
          };

          // cacheable.install method is not working for http.Agent.prototype and https.Agent.prototype,
          // and is used on globalAgent - cover only requests with default agent, and not cover tramvai http clients

          // @ts-expect-error
          const originalHttpCreateConnection = http.Agent.prototype.createConnection;
          // @ts-expect-error
          http.Agent.prototype.createConnection = function createDnsCachedConnection(
            options: any,
            callback: any
          ) {
            if (!('lookup' in options)) {
              // eslint-disable-next-line no-param-reassign
              options.lookup = cacheable.lookup;
            }
            return originalHttpCreateConnection.call(this, options, callback);
          };

          // @ts-expect-error
          const originalHttpsCreateConnection = https.Agent.prototype.createConnection;
          // @ts-expect-error
          https.Agent.prototype.createConnection = function createDnsCachedConnection(
            options: any,
            callback: any
          ) {
            if (!('lookup' in options)) {
              // eslint-disable-next-line no-param-reassign
              options.lookup = cacheable.lookup;
            }
            return originalHttpsCreateConnection.call(this, options, callback);
          };
        };
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
        cache: DNS_CACHEABLE_LOOKUP_CACHE_TOKEN,
      },
    }),
    provide({
      provide: DEFAULT_HTTP_CLIENT_INTERCEPTORS,
      useFactory: ({ envManager, cache, cacheHttp }) => {
        const dnsLookupEnabled = envManager.get('DNS_LOOKUP_CACHE_ENABLE') === 'true';

        return (req, next) => {
          if (dnsLookupEnabled) {
            return next(req).catch((e: any) => {
              // expected HTTP errors - https://github.com/Tinkoff/tinkoff-request/blob/master/packages/plugin-protocol-http/src/errors.ts
              const isExpectedError =
                e.code === 'ERR_HTTP_REQUEST_TIMEOUT' || e.code === 'ABORT_ERR';

              if (!isExpectedError) {
                if (req.baseUrl) {
                  const key = new URL(req.baseUrl).hostname;

                  // clear DNS lookup cache for all unexpected HTTP errors
                  cache.delete(key);
                  cacheHttp.delete(key);
                }
              }
              throw e;
            });
          }
          return next(req);
        };
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
        cache: DNS_UNDICI_LOOKUP_CACHE_TOKEN,
        cacheHttp: DNS_CACHEABLE_LOOKUP_CACHE_TOKEN,
      },
    }),
    provide({
      provide: DNS_CACHEABLE_LOOKUP_CACHE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ envManager, createCache }) => {
        const max = Number(envManager.get('DNS_LOOKUP_CACHE_LIMIT'));
        const dnsTTL = Number(envManager.get('DNS_LOOKUP_CACHE_TTL'));

        const cache = createCache('memory', { name: 'dns-lookup-http', max, ttl: dnsTTL });

        const adapter: CacheInstance = {
          set: (hostname: string, entries: any[], ttl: number): any => {
            return cache.set(hostname, entries, { ttl });
          },
          get: (hostname: string): any => {
            return cache.get(hostname);
          },
          delete: (hostname: string): boolean => {
            return cache.delete(hostname);
          },
          clear: (): void => {
            return cache.clear();
          },
        };

        return adapter;
      },
      deps: {
        createCache: CREATE_CACHE_TOKEN,
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: DNS_UNDICI_LOOKUP_CACHE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ envManager, createCache }) => {
        const max = Number(envManager.get('DNS_LOOKUP_CACHE_LIMIT'));
        const dnsTTL = Number(envManager.get('DNS_LOOKUP_CACHE_TTL'));

        const cache = createCache('memory', { name: 'dns-lookup', max, ttl: dnsTTL });

        const adapter: UndiciDnsCacheStorage = {
          set: (hostname: string, records: any, opts: { ttl: number }): void => {
            cache.set(hostname, records, opts);
          },
          get: (hostname: string): any => {
            return cache.get(hostname);
          },
          delete: (hostname: string) => {
            cache.delete(hostname);
          },
          full: (): boolean => {
            return false;
          },
          get size(): number {
            return cache.size;
          },
        };

        return adapter;
      },
      deps: {
        createCache: CREATE_CACHE_TOKEN,
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      multi: true,
      useValue: [
        { key: 'DNS_LOOKUP_CACHE_ENABLE', dehydrate: false, optional: true, value: 'true' },
        {
          key: 'DNS_LOOKUP_CACHE_LIMIT',
          value: '200',
          dehydrate: false,
          optional: true,
        },
        {
          key: 'DNS_LOOKUP_CACHE_TTL',
          value: '60000',
          dehydrate: false,
          optional: true,
        },
      ],
    }),
  ],
});
