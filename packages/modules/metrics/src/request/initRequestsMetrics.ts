import monkeypatch from '@tinkoff/monkeypatch';
import type LRUCache from '@tinkoff/lru-cache-nano';
import type { MetricsInstances, ModuleConfig } from '@tramvai/tokens-metrics';
import { TRAMVAI_INITED_SYMBOL } from '@tramvai/core';
import type { GetServiceName, CreateRequestWithMetrics, HttpModule, HttpsModule } from './types';
import { addMetricsForFetch, initConnectionResolveMetrics } from './createRequestWithMetrics';

export const initRequestsMetrics = ({
  requestMetrics,
  getServiceName,
  cache,
  http,
  https,
  createRequestWithMetrics,
  config,
}: {
  requestMetrics: MetricsInstances;
  http: HttpModule;
  cache: LRUCache<string, string>;
  https: HttpsModule;
  createRequestWithMetrics: CreateRequestWithMetrics;
  getServiceName: GetServiceName;
  config: ModuleConfig;
}) => {
  if (globalThis[TRAMVAI_INITED_SYMBOL]) {
    return;
  }

  addMetricsForFetch({ metricsInstances: requestMetrics, getServiceName, cache });

  if (config.enableConnectionResolveMetrics) {
    initConnectionResolveMetrics({ metricsInstances: requestMetrics, cache });
  }

  monkeypatch({
    obj: https,
    method: 'request',
    handler: createRequestWithMetrics({ metricsInstances: requestMetrics, getServiceName }),
  });
  monkeypatch({
    obj: http,
    method: 'request',
    handler: createRequestWithMetrics({ metricsInstances: requestMetrics, getServiceName }),
  });
};
