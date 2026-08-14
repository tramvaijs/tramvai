import http from 'http';
import https from 'https';
import noop from '@tinkoff/utils/function/noop';

import { Scope, Module, commandLineListTokens } from '@tramvai/core';
import type { MetricsInstances, ModuleConfig } from '@tramvai/tokens-metrics';
import { METRICS_MODULE_TOKEN, METRICS_MODULE_CONFIG_TOKEN } from '@tramvai/tokens-metrics';
import { CREATE_CACHE_TOKEN, ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
import {
  METRICS_IP_HOST_CACHE,
  METRICS_SERVICES_REGISTRY_TOKEN,
  REQUEST_METRICS_INSTANCES,
} from '@tramvai/tokens-metrics';

import { createRequestWithMetrics } from './createRequestWithMetrics';
import { initRequestsMetrics } from './initRequestsMetrics';
import { MetricsServicesRegistry } from './MetricsServicesRegistry';
import { DEFAULT_BUCKETS } from '../constants';

@Module({
  providers: [
    {
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: ({
        requestMetrics,
        envManager,
        cache,
        metricsServicesRegistry,
        metricsModuleConfig,
      }: {
        envManager: typeof ENV_MANAGER_TOKEN;
        metricsServicesRegistry: typeof METRICS_SERVICES_REGISTRY_TOKEN;
        requestMetrics?: MetricsInstances;
        cache: typeof METRICS_IP_HOST_CACHE;
        metricsModuleConfig: ModuleConfig;
      }) => {
        if (!requestMetrics) {
          return noop;
        }

        return () => {
          const env = envManager.getAll();
          metricsServicesRegistry.registerEnv(env);

          const getServiceName =
            metricsServicesRegistry.getServiceName.bind(metricsServicesRegistry);

          initRequestsMetrics({
            cache,
            requestMetrics,
            getServiceName,
            http,
            https,
            createRequestWithMetrics,
            config: metricsModuleConfig,
          });
        };
      },
      deps: {
        requestMetrics: REQUEST_METRICS_INSTANCES,
        cache: METRICS_IP_HOST_CACHE,
        metricsServicesRegistry: METRICS_SERVICES_REGISTRY_TOKEN,
        envManager: ENV_MANAGER_TOKEN,
        metricsModuleConfig: METRICS_MODULE_CONFIG_TOKEN,
      },
    },
    {
      scope: Scope.SINGLETON,
      provide: REQUEST_METRICS_INSTANCES,
      useFactory: ({ metrics }) => {
        if (!metrics) {
          return undefined;
        }

        const requestMetrics = {
          requestsTotal: metrics.counter({
            name: 'http_sent_requests_total',
            help: 'Number of requests sent',
            labelNames: ['status', 'method', 'service'],
          }),
          requestsErrors: metrics.counter({
            name: 'http_sent_requests_errors',
            help: 'Number of requests that failed',
            labelNames: ['status', 'method', 'service'],
          }),
          requestsDuration: metrics.histogram({
            name: 'http_sent_requests_duration',
            help: 'Execution time of the sent requests',
            labelNames: ['status', 'method', 'service'],
            buckets: DEFAULT_BUCKETS,
          }),
          dnsResolveDuration: metrics.histogram({
            name: 'dns_resolve_duration',
            help: 'Time for dns resolve of the outhgoing requests',
            labelNames: ['service'],
            buckets: DEFAULT_BUCKETS,
          }),
          tcpConnectDuration: metrics.histogram({
            name: 'tcp_connect_duration',
            help: 'Duration of tcp connect of the outgoing requests',
            labelNames: ['service'],
            buckets: DEFAULT_BUCKETS,
          }),
          tlsHandshakeDuration: metrics.histogram({
            name: 'tls_handshake_duration',
            help: 'Duration of tls handshake of the outgoing requests',
            labelNames: ['service'],
            buckets: DEFAULT_BUCKETS,
          }),
        };

        return requestMetrics;
      },
      deps: {
        metrics: {
          token: METRICS_MODULE_TOKEN,
          optional: true,
        },
      },
    },
    {
      scope: Scope.SINGLETON,
      provide: METRICS_IP_HOST_CACHE,
      useFactory: ({ createCache }) =>
        createCache('memory', {
          name: 'request-ip-host-cache',
          max: 100,
        }),
      deps: {
        createCache: CREATE_CACHE_TOKEN,
      },
    },
    {
      provide: METRICS_SERVICES_REGISTRY_TOKEN,
      useClass: MetricsServicesRegistry,
      scope: Scope.SINGLETON,
    },
  ],
})
export class RequestModule {}
