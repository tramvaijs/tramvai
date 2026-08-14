/* eslint-disable no-param-reassign */
import dns from 'dns';
import { Counter, Histogram, Registry } from 'prom-client';
import type { Express } from 'express';
import { Agent, fetch } from 'undici';

import {
  delayResponseWithFakeTimers,
  startMockServer,
  startHttpsMockServer,
} from '@tramvai/internal-test-utils/utils/simpleMockServer';
import {
  initConnectionResolveMetrics,
  addMetricsForFetch,
} from '@tramvai/module-metrics/lib/request/createRequestWithMetrics';

import { createDnsInterceptor, UndiciDnsCacheStorage } from './dns-interceptor';

const DEFAULT_BUCKETS = [
  0.005, 0.007, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 20, 40, 60,
];

// .invalid is reserved and never resolves for real, so we always hit the mocked dns.lookup
const FAKE_HOST = 'dns-test.invalid';

const applyResponseHandler = (app: Express) => {
  app.get('/test', async (req, res) => {
    await delayResponseWithFakeTimers(100);
    res.send('ok');
  });
  app.get('/err', async (req, res) => {
    await delayResponseWithFakeTimers(100);
    res.sendStatus(500);
  });
};

const getMetricByName = (metrics: Record<string, any>, targetMetricName: string) => {
  return metrics.filter((metric: Record<string, any>) => metric.name === targetMetricName)[0];
};

const createStorage = () => {
  const map = new Map<string, unknown>();

  const storage: UndiciDnsCacheStorage = {
    get: jest.fn((hostname: string) => map.get(hostname) as any),
    set: jest.fn((hostname: string, records: any) => {
      map.set(hostname, records);
    }),
    delete: jest.fn((hostname: string) => {
      map.delete(hostname);
    }),
    full: () => false,
    get size() {
      return map.size;
    },
  };

  return storage;
};

// mirrors the cacheable-lookup CacheInstance adapter (DNS_CACHEABLE_LOOKUP_CACHE_TOKEN)
const createHttpCache = () => {
  const map = new Map<string, unknown>();

  return {
    get: jest.fn((hostname: string) => map.get(hostname)),
    set: jest.fn((hostname: string, value: unknown) => {
      map.set(hostname, value);
    }),
    delete: jest.fn((hostname: string) => map.delete(hostname)),
    clear: jest.fn(() => map.clear()),
  };
};

const createIpHostCache = () => {
  const map = new Map<string, string>();

  return {
    get: jest.fn((key: string) => map.get(key)),
    set: jest.fn((key: string, value: string) => {
      map.set(key, value);
    }),
  };
};

describe('dns-interceptor', () => {
  let lookupSpy: jest.SpyInstance;
  let lookupCallCount: number;

  beforeEach(() => {
    lookupCallCount = 0;
    const originalLookup = dns.lookup;

    // undici reads dns.lookup from the module object at call time (see createDnsInterceptor),
    // so patching it here is picked up by the interceptor
    lookupSpy = jest
      .spyOn(dns, 'lookup')
      // @ts-expect-error
      .mockImplementation((hostname: any, options: any, callback: any) => {
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        if (hostname === FAKE_HOST) {
          lookupCallCount += 1;

          if (options && options.all) {
            callback(null, [
              { address: '127.0.0.1', family: 4 },
              { address: '::1', family: 6 },
            ]);
          } else {
            callback(null, '127.0.0.1', 4);
          }
          return undefined as any;
        }

        return (originalLookup as any)(hostname, options, callback);
      });
  });

  afterEach(() => {
    lookupSpy.mockRestore();
  });

  describe('createDnsInterceptor', () => {
    let registry: Registry;
    let dnsResolveDuration: Histogram<string>;

    const observeLookup = (hostname: string, lookupDuration: number) =>
      dnsResolveDuration.observe({ service: hostname }, lookupDuration);

    beforeEach(() => {
      registry = new Registry();
      dnsResolveDuration = new Histogram({
        registers: [registry],
        name: 'dns_resolve_duration',
        help: 'Time for dns resolve of the outgoing requests',
        labelNames: ['service'],
        buckets: DEFAULT_BUCKETS,
      });
    });

    it('should observe dns resolve duration metric and populate ip -> host cache on lookup', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const storage = createStorage();
      const ipHostCache = createIpHostCache();
      const onLookupEnd = jest.fn(observeLookup);

      const interceptor = createDnsInterceptor({
        maxTTL: 60000,
        maxItems: 200,
        storage,
        ipHostCache: ipHostCache as any,
        onLookupEnd,
      });

      const dispatcher = new Agent().compose(interceptor);

      const response = await fetch(`http://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await response.text()).toBe('ok');

      // the resolved hostname reaches the metric via onLookupEnd
      expect(onLookupEnd).toHaveBeenCalledTimes(1);
      expect(onLookupEnd.mock.calls[0][0]).toBe(FAKE_HOST);
      expect(typeof onLookupEnd.mock.calls[0][1]).toBe('number');

      const metrics = await registry.getMetricsAsJSON();
      const dnsResolveMetric = getMetricByName(metrics, 'dns_resolve_duration');
      expect(dnsResolveMetric.values.length).toBe(18);
      expect(dnsResolveMetric.values[0].labels.service).toBe(FAKE_HOST);

      // ip -> host mapping is filled so that connection metrics can recover the hostname from the ip
      expect(ipHostCache.set).toHaveBeenCalledWith('127.0.0.1', FAKE_HOST);
      expect(ipHostCache.set).toHaveBeenCalledWith('::1', FAKE_HOST);
      // resolved records are stored in the undici cache
      expect(storage.set).toHaveBeenCalledTimes(1);

      await dispatcher.close();
      await terminate();
    });

    it('should reuse cached dns records for subsequent requests to the same host', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const storage = createStorage();
      const ipHostCache = createIpHostCache();
      const onLookupEnd = jest.fn(observeLookup);

      const interceptor = createDnsInterceptor({
        maxTTL: 60000,
        maxItems: 200,
        storage,
        ipHostCache: ipHostCache as any,
        onLookupEnd,
      });

      const dispatcher = new Agent().compose(interceptor);

      const first = await fetch(`http://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await first.text()).toBe('ok');

      const second = await fetch(`http://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await second.text()).toBe('ok');

      // the second request is served from the undici cache, so dns.lookup runs only once
      expect(lookupCallCount).toBe(1);
      expect(onLookupEnd).toHaveBeenCalledTimes(1);

      await dispatcher.close();
      await terminate();
    });

    it('should still report the lookup metric and skip the ip cache when lookup fails', async () => {
      const storage = createStorage();
      const ipHostCache = createIpHostCache();
      const onLookupEnd = jest.fn(observeLookup);

      lookupSpy.mockImplementation((hostname: any, options: any, callback: any) => {
        if (typeof options === 'function') {
          callback = options;
        }
        callback(Object.assign(new Error('lookup failed'), { code: 'ENOTFOUND' }));
        return undefined as any;
      });

      const interceptor = createDnsInterceptor({
        maxTTL: 60000,
        maxItems: 200,
        storage,
        ipHostCache: ipHostCache as any,
        onLookupEnd,
      });

      const dispatcher = new Agent().compose(interceptor);

      await expect(fetch(`http://${FAKE_HOST}/test`, { dispatcher })).rejects.toThrow();

      // the timing metric is reported even on failure...
      expect(onLookupEnd).toHaveBeenCalledTimes(1);
      expect(onLookupEnd.mock.calls[0][0]).toBe(FAKE_HOST);
      // ...but nothing is cached
      expect(ipHostCache.set).not.toHaveBeenCalled();
      expect(storage.set).not.toHaveBeenCalled();

      await dispatcher.close();
    });
  });

  describe('metrics integration', () => {
    let registry: Registry;
    let metricsInstances: any;
    let ipHostCache: Map<string, string>;
    let cache: any;

    beforeAll(() => {
      registry = new Registry();
      ipHostCache = new Map();
      cache = {
        get: (key: string) => ipHostCache.get(key),
        set: (key: string, value: string) => {
          ipHostCache.set(key, value);
        },
      };

      const histogram = (name: string, labelNames: string[]) =>
        new Histogram({
          registers: [registry],
          name,
          help: name,
          labelNames,
          buckets: DEFAULT_BUCKETS,
        });

      metricsInstances = {
        dnsResolveDuration: histogram('dns_resolve_duration', ['service']),
        tcpConnectDuration: histogram('tcp_connect_duration', ['service']),
        tlsHandshakeDuration: histogram('tls_handshake_duration', ['service']),
        requestsTotal: new Counter({
          registers: [registry],
          name: 'http_sent_requests_total',
          help: 'http_sent_requests_total',
          labelNames: ['status', 'method', 'service'],
        }),
        requestsErrors: new Counter({
          registers: [registry],
          name: 'http_sent_requests_errors',
          help: 'http_sent_requests_errors',
          labelNames: ['status', 'method', 'service'],
        }),
        requestsDuration: histogram('http_sent_requests_duration', ['status', 'method', 'service']),
      };

      initConnectionResolveMetrics({ metricsInstances, cache });
      addMetricsForFetch({ metricsInstances, getServiceName: (() => undefined) as any, cache });
    });

    afterEach(() => {
      registry.resetMetrics();
      ipHostCache.clear();
    });

    const createDnsCacheDispatcher = (options?: Agent.Options) => {
      const interceptor = createDnsInterceptor({
        maxTTL: 60000,
        maxItems: 200,
        storage: createStorage(),
        ipHostCache: cache,
        onLookupEnd: (hostname: string, lookupDuration: number) =>
          metricsInstances.dnsResolveDuration.observe({ service: hostname }, lookupDuration),
      });

      return new Agent(options).compose(interceptor);
    };

    it('should label connection metrics with the real host instead of the ip when the dns cache is enabled', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);
      const dispatcher = createDnsCacheDispatcher();

      const response = await fetch(`http://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const tcpConnectMetric = getMetricByName(metrics, 'tcp_connect_duration');
      expect(tcpConnectMetric.values.length).toBe(18);

      expect(tcpConnectMetric.values[0].labels.service).toBe(`http://${FAKE_HOST}`);
      expect(tcpConnectMetric.values[0].labels.service).not.toContain('127.0.0.1');

      await dispatcher.close();
      await terminate();
    });

    it('should label fetch request metrics with the real host instead of the ip when the dns cache is enabled', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);
      const dispatcher = createDnsCacheDispatcher();

      const response = await fetch(`http://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe(`http://${FAKE_HOST}:${port}`);
      expect(requestMetric.labels.service).not.toContain('127.0.0.1');

      await dispatcher.close();
      await terminate();
    });

    it('should label the tls handshake metric with the real host instead of the ip when the dns cache is enabled', async () => {
      const { port, terminate } = await startHttpsMockServer(applyResponseHandler);
      const dispatcher = createDnsCacheDispatcher({ connect: { rejectUnauthorized: false } });

      const response = await fetch(`https://${FAKE_HOST}:${port}/test`, { dispatcher });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const tlsHandshakeMetric = getMetricByName(metrics, 'tls_handshake_duration');
      expect(tlsHandshakeMetric.values.length).toBe(18);

      expect(tlsHandshakeMetric.values[0].labels.service).toBe(`https://${FAKE_HOST}`);
      expect(tlsHandshakeMetric.values[0].labels.service).not.toContain('127.0.0.1');

      await dispatcher.close();
      await terminate();
    });
  });
});
