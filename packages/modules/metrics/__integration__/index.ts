import { createApp, commandLineListTokens } from '@tramvai/core';
import { MetricsModule } from '@tramvai/module-metrics';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { METRICS_MODULE_TOKEN, REGISTER_INSTANT_METRIC_TOKEN } from '@tramvai/tokens-metrics';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

createApp({
  name: 'metrics',
  modules: [...modules, MetricsModule],
  providers: [
    {
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ httpClient }) => {
        return () => {
          if (typeof window === 'undefined') {
            httpClient.request({ url: 'http://not-exists.com' }).catch(() => {});

            fetch('http://not-exists.com', {
              headers: {
                'x-tramvai-service-name': 'FETCH_REQUEST',
              },
            }).catch(() => {});

            const http = require('http');
            http.request(
              'http://not-exists.com',
              {
                headers: {
                  'x-tramvai-service-name': 'HTTP_REQUEST',
                },
              },
              () => {}
            );
          }
        };
      },
      deps: {
        httpClient: HTTP_CLIENT,
      },
    },
    typeof window === 'undefined'
      ? {
          provide: REGISTER_INSTANT_METRIC_TOKEN,
          multi: true,
          deps: {
            metrics: METRICS_MODULE_TOKEN,
          },
          useFactory({ metrics }) {
            return ['sent-instant-metric', metrics.counter({ name: 'test', help: 'test' })];
          },
        }
      : {
          provide: commandLineListTokens.customerStart,
          multi: true,
          deps: {
            logger: LOGGER_TOKEN,
          },
          useFactory({ logger }) {
            return () => {
              logger.info({ event: 'sent-instant-metric' });
              logger.info({ event: 'didntsend-instant-metric' });
            };
          },
        },
  ],
  bundles,
});
