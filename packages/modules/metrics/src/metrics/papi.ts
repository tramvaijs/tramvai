import noop from '@tinkoff/utils/function/noop';
import { METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';

import type { FastifyInstance } from 'fastify';

const METRICS_PAPI_TIMER = '_papi_metrics_timer';

declare module 'fastify' {
  interface FastifyRequest {
    [METRICS_PAPI_TIMER]: (labels?: Record<string, any>) => void;
  }
}

const LABEL_NAMES = ['method', 'path', 'status'];

const DEFAULT_BUCKETS = [0.01, 0.05, 0.1, 0.3, 0.4, 0.5, 1, 2.5, 5, 10, 20, 40, 60];

export interface AddPapiMetricsOptions {
  metrics: typeof METRICS_MODULE_TOKEN;
}

export const papiMetrics = async (fastify: FastifyInstance, { metrics }: AddPapiMetricsOptions) => {
  const requestTotal = metrics.counter({
    name: 'papi_requests_total',
    help: 'Total PAPI requests processed',
    labelNames: LABEL_NAMES,
  });

  const executionTime = metrics.histogram({
    name: 'papi_requests_execution_time',
    help: 'PAPI requests processing duration',
    buckets: DEFAULT_BUCKETS,
    labelNames: LABEL_NAMES,
  });

  fastify.decorateRequest(METRICS_PAPI_TIMER, noop);

  fastify.addHook('onRequest', async (req) => {
    req[METRICS_PAPI_TIMER] = executionTime.startTimer();
  });

  fastify.addHook('onResponse', async (req, res) => {
    const labels = {
      method: req.method,
      path: req.routeOptions.url ?? req.url,
      status: res.statusCode,
    };

    requestTotal.inc(labels);
    req[METRICS_PAPI_TIMER](labels);
  });
};
