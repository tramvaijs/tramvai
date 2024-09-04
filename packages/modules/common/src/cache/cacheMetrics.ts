import type { ExtractTokenType } from '@tinkoff/dippy';
import { Scope, provide } from '@tinkoff/dippy';
import {
  CACHE_METRICS_SERVER_TOKEN,
  type CacheServerMetricsHandlers,
} from '@tramvai/tokens-common';
import type { Counter, Gauge } from '@tramvai/tokens-metrics';
import { METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';

type CacheMetrics = {
  hitCounter: Counter;
  missCounter: Counter;
  cacheMaxGauge: Gauge;
  cacheSizeGauge: Gauge;
};

const cacheMetricsServerFactory = ({
  metrics,
}: {
  metrics: ExtractTokenType<typeof METRICS_MODULE_TOKEN> | null;
}): CacheServerMetricsHandlers => {
  const cacheMetrics: CacheMetrics | undefined = metrics
    ? {
        hitCounter: metrics.counter({
          name: 'cache_hit',
          help: 'Successful access to retrieve data from a cache.',
          labelNames: ['name', 'method'],
        }),
        missCounter: metrics.counter({
          name: 'cache_miss',
          help: 'Failed request to retrieve data from a cache.',
          labelNames: ['name', 'method'],
        }),
        cacheMaxGauge: metrics.gauge({
          name: 'cache_max',
          help: 'Maximum number of items in a cache.',
          labelNames: ['name'],
        }),
        cacheSizeGauge: metrics.gauge({
          name: 'cache_size',
          help: 'The total number of items in a cache at the current moment.',
          labelNames: ['name'],
        }),
      }
    : undefined;

  return {
    onHit(name, method) {
      cacheMetrics?.hitCounter.inc({ name, method });
    },
    onMiss(name, method) {
      cacheMetrics?.missCounter.inc({ name, method });
    },
    onMax(name, size) {
      cacheMetrics?.cacheMaxGauge.set({ name }, size);
    },
    onSize(name, size) {
      cacheMetrics?.cacheSizeGauge.set({ name }, size);
    },
  };
};

export const cacheMetricsServerProviders = [
  provide({
    provide: CACHE_METRICS_SERVER_TOKEN,
    useFactory: cacheMetricsServerFactory,
    scope: Scope.SINGLETON,
    deps: {
      metrics: { token: METRICS_MODULE_TOKEN, optional: true },
    },
  }),
];
