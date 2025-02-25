import { Module, Scope, provide } from '@tramvai/core';
import { METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';
import { ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/tokens-common';
import { WEB_FASTIFY_APP_LIMITER_TOKEN } from '@tramvai/tokens-server-private';
import { DEFAULT_OPTIONS, fastifyRequestsLimiter, RequestLimiter } from './requestLimiter';
import {
  REQUESTS_LIMITER_TOKEN,
  REQUESTS_LIMITER_METRICS_TOKEN,
  REQUESTS_LIMITER_OPTIONS_TOKEN,
  REQUESTS_LIMITER_ACTIVATE_TOKEN,
} from './tokens';
import type { RequestQueuedResult } from './requestLimiter';

export * from './requestLimiter';
export * from './tokens';

@Module({
  providers: [
    provide({
      provide: ENV_USED_TOKEN,
      multi: true,
      useValue: [
        {
          key: 'REQUEST_LIMITER_MELD',
          optional: true,
        },
        {
          key: 'REQUEST_LIMITER_QUEUE',
          optional: true,
        },
        {
          key: 'REQUEST_LIMITER_LIMIT',
          optional: true,
        },
      ],
    }),

    provide({
      provide: REQUESTS_LIMITER_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ options, featureEnable, envManager, metrics }) => {
        if (featureEnable === false) {
          return;
        }

        const meld = envManager.get('REQUEST_LIMITER_MELD');
        const queue = envManager.get('REQUEST_LIMITER_QUEUE');
        const limit = envManager.get('REQUEST_LIMITER_LIMIT');

        const resultOptions = {
          limit: limit ? Number(limit) : (options?.limit ?? DEFAULT_OPTIONS.limit),
          queue: queue ? Number(queue) : (options?.queue ?? DEFAULT_OPTIONS.queue),
          maxEventLoopDelay: meld
            ? Number(meld)
            : (options?.maxEventLoopDelay ?? DEFAULT_OPTIONS.maxEventLoopDelay),
          error: options?.error ?? DEFAULT_OPTIONS.error,
        };

        return new RequestLimiter(resultOptions, metrics);
      },
      deps: {
        options: { token: REQUESTS_LIMITER_OPTIONS_TOKEN, optional: true },
        featureEnable: { token: REQUESTS_LIMITER_ACTIVATE_TOKEN, optional: true },
        envManager: ENV_MANAGER_TOKEN,
        metrics: REQUESTS_LIMITER_METRICS_TOKEN,
      },
    }),
    provide({
      provide: WEB_FASTIFY_APP_LIMITER_TOKEN,
      multi: true,
      useFactory: ({ requestsLimiter, featureEnable }) => {
        return async (app) => {
          if (featureEnable === false) {
            return;
          }

          await fastifyRequestsLimiter(app, { requestsLimiter });
        };
      },
      deps: {
        requestsLimiter: REQUESTS_LIMITER_TOKEN,
        featureEnable: { token: REQUESTS_LIMITER_ACTIVATE_TOKEN, optional: true },
      },
    }),
    provide({
      provide: REQUESTS_LIMITER_METRICS_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ metrics }) => {
        const queueSizeGauge = metrics.gauge({
          name: 'http_requests_limiter_queue_size',
          help: 'Number of requests in the queue',
        });

        const queueLimitGauge = metrics.gauge({
          name: 'http_requests_limiter_queue_limit',
          help: 'Maximum number of requests in the queue',
        });

        const currentRequestsGauge = metrics.gauge({
          name: 'http_requests_limiter_current_requests',
          help: 'Number of currently active requests',
        });

        const currentRequestsLimitGauge = metrics.gauge({
          name: 'http_requests_limiter_current_requests_limit',
          help: 'Maximum number of active requests',
        });

        const requestsQueuedTimeHistogram = metrics.histogram({
          name: 'http_requests_limiter_requests_queued_seconds',
          help: 'Number of seconds requests were in the queue',
          labelNames: ['result'],
          buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 4, 5, 8, 10, 20],
        });

        return {
          collectQueueLimit: (value: number) => {
            queueLimitGauge.set(value);
          },
          collectQueueSize: (value: number) => {
            queueSizeGauge.set(value);
          },
          collectCurrentRequests: (value: number) => {
            currentRequestsGauge.set(value);
          },
          collectCurrentRequestsLimit: (value: number) => {
            currentRequestsLimitGauge.set(value);
          },
          collectRequestsQueuedTime: (result: RequestQueuedResult, durationMS: number) => {
            requestsQueuedTimeHistogram.observe({ result }, durationMS / 1000);
          },
        };
      },
      deps: {
        metrics: METRICS_MODULE_TOKEN,
      },
    }),
  ],
})
export class RequestLimiterModule {}
