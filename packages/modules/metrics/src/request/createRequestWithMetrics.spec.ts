import { Counter, Histogram, Registry } from 'prom-client';
import type { Express } from 'express';
import http from 'node:http';
import https from 'node:https';
import { Agent, fetch } from 'undici';

import {
  delayResponseWithFakeTimers,
  startMockServer,
  startHttpsMockServer,
} from '@tramvai/internal-test-utils/utils/simpleMockServer';
import {
  getUrlAndOptions,
  initConnectionResolveMetrics,
  addMetricsForFetch,
} from './createRequestWithMetrics';
import { MetricsServicesRegistry } from './MetricsServicesRegistry';
import { DEFAULT_BUCKETS } from '../constants';
import { MetricsInstances } from './types';

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

describe('createRequestWithMetrics', () => {
  [
    [
      ['http://example.com/'],
      ['http://example.com/', {}, new URL('http://example.com/')],
      'string url',
    ],
    [
      [new URL('http://example.com/')],
      ['http://example.com/', {}, new URL('http://example.com/')],
      'object url',
    ],
    [
      ['http://example.com/', { op: 'tions' }],
      ['http://example.com/', { op: 'tions' }, new URL('http://example.com/')],
      'string url and options object',
    ],
    [
      [new URL('http://example.com/'), { op: 'tions' }],
      ['http://example.com/', { op: 'tions' }, new URL('http://example.com/')],
      'object url and options object',
    ],
    [
      [{ op: 'tions', href: 'https://example.com/?utm_source=google' }],
      [
        'https://example.com/',
        { op: 'tions', href: 'https://example.com/?utm_source=google' },
        new URL('https://example.com/?utm_source=google'),
      ],
      'options object contained href',
    ],
    [
      [
        {
          op: 'tions',
          protocol: 'https',
          host: 'example.com',
          path: '/path/?utm_source=google',
        },
      ],
      [
        'https://example.com/path/',
        {
          op: 'tions',
          protocol: 'https',
          host: 'example.com',
          path: '/path/?utm_source=google',
        },
        new URL('https://example.com/path/?utm_source=google'),
      ],
      'options object contained object url',
    ],
  ].forEach(([args, result, title]) => {
    it(`Parse args: ${title}`, () => {
      expect(getUrlAndOptions.call(null, args)).toEqual(result);
    });
  });

  describe('initConnectionResolveMetrics', () => {
    let metricsInstances: Partial<MetricsInstances>;
    let registry: Registry;

    beforeAll(() => {
      registry = new Registry();

      metricsInstances = {
        dnsResolveDuration: new Histogram({
          registers: [registry],
          name: 'dns_resolve_duration',
          help: 'Time for dns resolve of the outhgoing requests',
          labelNames: ['service'],
          buckets: DEFAULT_BUCKETS,
        }),
        tcpConnectDuration: new Histogram({
          registers: [registry],
          name: 'tcp_connect_duration',
          help: 'Duration of tcp connect of the outgoing requests',
          labelNames: ['service'],
          buckets: DEFAULT_BUCKETS,
        }),
        tlsHandshakeDuration: new Histogram({
          registers: [registry],
          name: 'tls_handshake_duration',
          help: 'Duration of tls handshake of the outgoing requests',
          labelNames: ['service'],
          buckets: DEFAULT_BUCKETS,
        }),
      };

      initConnectionResolveMetrics({ metricsInstances });
    });

    afterEach(() => {
      registry.resetMetrics();
    });

    it('should correctly collect connection metrics for fetch http request', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const response = await fetch(`http://localhost:${port}/test`);
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const tcpConnectMetric = getMetricByName(metrics, 'tcp_connect_duration');
      expect(tcpConnectMetric.values.length).toBe(18);
      expect(tcpConnectMetric.values[0].labels.service).toBe('http://localhost');

      const dnsResolvMetric = getMetricByName(metrics, 'dns_resolve_duration');
      expect(dnsResolvMetric.values.length).toBe(18);
      expect(dnsResolvMetric.values[0].labels.service).toBe('localhost');

      expect(getMetricByName(metrics, 'tls_handshake_duration').values.length).toBe(0);

      await terminate();
    });

    it('should correctly collect connection metrics for fetch https request', async () => {
      const { port, terminate } = await startHttpsMockServer(applyResponseHandler);

      const response = await fetch(`https://localhost:${port}/test`, {
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        }),
      });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const tcpConnectMetric = getMetricByName(metrics, 'tcp_connect_duration');
      expect(tcpConnectMetric.values.length).toBe(18);
      expect(tcpConnectMetric.values[0].labels.service).toBe('https://localhost');

      const dnsResolvMetric = getMetricByName(metrics, 'dns_resolve_duration');
      expect(dnsResolvMetric.values.length).toBe(18);
      expect(dnsResolvMetric.values[0].labels.service).toBe('localhost');

      const tlsHandshakeMetric = getMetricByName(metrics, 'tls_handshake_duration');
      expect(tlsHandshakeMetric.values.length).toBe(18);
      expect(tlsHandshakeMetric.values[0].labels.service).toBe('https://localhost');

      await terminate();
    });

    it('should correctly collect connection metrics for node http', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const response = await new Promise((resolve) => {
        let result = '';

        const req = http.request(`http://localhost:${port}/test`, (res) => {
          res.on('data', (chunk) => {
            result += chunk;
          });

          res.on('end', () => {
            resolve(result);
          });
        });

        req.end();
      });
      expect(response).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();
      const tcpConnectMetric = getMetricByName(metrics, 'tcp_connect_duration');
      expect(tcpConnectMetric.values.length).toBe(18);
      expect(tcpConnectMetric.values[0].labels.service).toBe('http://localhost');

      const dnsResolvMetric = getMetricByName(metrics, 'dns_resolve_duration');
      expect(dnsResolvMetric.values.length).toBe(18);
      expect(dnsResolvMetric.values[0].labels.service).toBe('localhost');

      expect(getMetricByName(metrics, 'tls_handshake_duration').values.length).toBe(0);

      await terminate();
    });

    it('should correctly collect connection metrics for node https', async () => {
      const { port, terminate } = await startHttpsMockServer(applyResponseHandler);

      const agentOptions = {
        rejectUnauthorized: false,
      };

      const agent = new https.Agent(agentOptions);

      const response = await new Promise((resolve) => {
        let result = '';

        const req = https.request(
          `https://localhost:${port}/test`,
          {
            agent,
          },
          (res) => {
            res.on('data', (chunk) => {
              result += chunk;
            });

            res.on('end', () => {
              resolve(result);
            });
          }
        );

        req.end();
      });
      expect(response).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();
      const tcpConnectMetric = getMetricByName(metrics, 'tcp_connect_duration');
      expect(tcpConnectMetric.values.length).toBe(18);
      expect(tcpConnectMetric.values[0].labels.service).toBe('https://localhost');

      const dnsResolvMetric = getMetricByName(metrics, 'dns_resolve_duration');
      expect(dnsResolvMetric.values.length).toBe(18);
      expect(dnsResolvMetric.values[0].labels.service).toBe('localhost');

      const tlsHandshakeMetric = getMetricByName(metrics, 'tls_handshake_duration');
      expect(tlsHandshakeMetric.values.length).toBe(18);
      expect(tlsHandshakeMetric.values[0].labels.service).toBe('https://localhost');

      await terminate();
    });
  });

  describe('addMetricsForFetch', () => {
    let metricsInstances: Partial<MetricsInstances>;
    let registry: Registry;

    beforeAll(() => {
      registry = new Registry();

      metricsInstances = {
        requestsTotal: new Counter({
          registers: [registry],
          name: 'http_sent_requests_total',
          help: 'Number of requests sent',
          labelNames: ['status', 'method', 'service'],
        }),
        requestsErrors: new Counter({
          registers: [registry],
          name: 'http_sent_requests_errors',
          help: 'Number of requests that failed',
          labelNames: ['status', 'method', 'service'],
        }),
        requestsDuration: new Histogram({
          registers: [registry],
          name: 'http_sent_requests_duration',
          help: 'Execution time of the sent requests',
          labelNames: ['status', 'method', 'service'],
          buckets: DEFAULT_BUCKETS,
        }),
      };

      const metricsServicesRegistry = new MetricsServicesRegistry();
      metricsServicesRegistry.register('http://not-existing-domain.com', 'CUSTOM_SERVICE');
      metricsServicesRegistry.register(
        'http://custom-port-domain.com:5000',
        'OTHER_CUSTOM_SERVICE'
      );

      addMetricsForFetch({
        // @ts-expect-error
        metricsInstances,
        getServiceName: metricsServicesRegistry.getServiceName.bind(metricsServicesRegistry),
      });
    });

    afterEach(() => {
      registry.resetMetrics();
    });

    it('should correctly collect fetch metrics for http request', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const response = await fetch(`http://localhost:${port}/test`);
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe(`http://localhost:${port}`);

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(0);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);

      await terminate();
    });

    it('should correctly collect errors for fetch http request', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const response = await fetch(`http://localhost:${port}/err`);
      expect(await response.status).toBe(500);

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe(`http://localhost:${port}`);

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);

      await terminate();
    });

    it('should correctly collect connection metrics for fetch https request', async () => {
      const { port, terminate } = await startHttpsMockServer(applyResponseHandler);

      const response = await fetch(`https://localhost:${port}/test`, {
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        }),
      });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe(`https://localhost:${port}`);

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(0);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);

      await terminate();
    });

    it('should correctly collect errors for fetch https request', async () => {
      const { port, terminate } = await startHttpsMockServer(applyResponseHandler);

      const response = await fetch(`https://localhost:${port}/err`, {
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        }),
      });
      expect(await response.status).toBe(500);

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe(`https://localhost:${port}`);

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);

      await terminate();
    });

    it('should correctly extract service name from request headers', async () => {
      const { port, terminate } = await startMockServer(applyResponseHandler);

      const response = await fetch(`http://localhost:${port}/test`, {
        headers: {
          'x-tramvai-service-name': 'CUSTOM_SERVICE',
        },
      });
      expect(await response.text()).toBe('ok');

      const metrics = await registry.getMetricsAsJSON();

      const requestMetric = getMetricByName(metrics, 'http_sent_requests_total').values[0];
      expect(requestMetric.value).toBe(1);
      expect(requestMetric.labels.service).toBe('CUSTOM_SERVICE');

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(0);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);

      await terminate();
    });

    it('should correctly extract service name from env variable with prefix tree', async () => {
      try {
        await fetch(`http://not-existing-domain.com`);
      } catch (_err) {}

      const metrics = await registry.getMetricsAsJSON();

      const requstErrorMetric = getMetricByName(metrics, 'http_sent_requests_errors').values[0];
      expect(requstErrorMetric.value).toBe(1);
      expect(requstErrorMetric.labels.service).toBe('CUSTOM_SERVICE');

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);
    });

    it('should correctly extract service name from env variable with port', async () => {
      try {
        await fetch(`http://custom-port-domain.com:5000`);
      } catch (_err) {}

      const metrics = await registry.getMetricsAsJSON();

      const requstErrorMetric = getMetricByName(metrics, 'http_sent_requests_errors').values[0];
      expect(requstErrorMetric.value).toBe(1);
      expect(requstErrorMetric.labels.service).toBe('OTHER_CUSTOM_SERVICE');

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);
    });

    it('should correctly extract host with env collision', async () => {
      try {
        await fetch(`http://custom-port-domain.com`);
      } catch (_err) {}

      const metrics = await registry.getMetricsAsJSON();

      const requstErrorMetric = getMetricByName(metrics, 'http_sent_requests_errors').values[0];
      expect(requstErrorMetric.value).toBe(1);
      expect(requstErrorMetric.labels.service).toBe('http://custom-port-domain.com');

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);
    });

    it('should correctly extract host with custom port', async () => {
      try {
        await fetch(`http://localhost:4000`);
      } catch (_err) {}

      const metrics = await registry.getMetricsAsJSON();

      const requstErrorMetric = getMetricByName(metrics, 'http_sent_requests_errors').values[0];
      expect(requstErrorMetric.value).toBe(1);
      expect(requstErrorMetric.labels.service).toBe('http://localhost:4000');

      expect(getMetricByName(metrics, 'http_sent_requests_errors').values.length).toBe(1);
      expect(getMetricByName(metrics, 'http_sent_requests_duration').values.length).toBe(18);
    });
  });
});
