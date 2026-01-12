import diagnosticsChannel from 'node:diagnostics_channel';
import { commandLineListTokens, Module, optional, provide } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';
import {
  HTTP_CLIENT_AGENT,
  HTTP_CLIENT_AGENT_OPTIONS,
  HTTP_CLIENT_AGENT_INTERCEPTORS,
} from '@tramvai/tokens-http-client';
import { EnvHttpProxyAgent } from 'undici';
import { getHttpsProxy, getNoProxy, httpProxyEnabled } from './utils/env';
import { addProxyToHttpsAgent } from './add-proxy-to-https-agent/add-proxy-to-https-agent';

@Module({
  imports: [],
  providers: [
    httpProxyEnabled() &&
      provide({
        provide: HTTP_CLIENT_AGENT,
        useFactory: ({ options, interceptors, loggerFactory, metrics }) => {
          const logger = loggerFactory('http-proxy-agent');
          const proxyEnv = getHttpsProxy();
          const noProxyEnv = getNoProxy();

          const metricsConnectionCounter = metrics.counter({
            name: 'http_proxy_undici_connect_total',
            help: 'Number of proxy connects with Undici',
            labelNames: ['host'],
          });

          // https://github.com/nodejs/undici/pull/4659
          diagnosticsChannel.channel('undici:proxy:connected').subscribe(({ connectParams }) => {
            logger.debug({
              event: 'proxy undici connection',
              connection: connectParams,
            });

            metricsConnectionCounter.inc({ host: new URL(connectParams.origin).host });
          });

          const agent = new EnvHttpProxyAgent({
            httpProxy: proxyEnv,
            httpsProxy: proxyEnv,
            noProxy: noProxyEnv,
            ...options,
          }).compose(...(interceptors ?? []));

          return {
            http: agent,
            https: agent,
          };
        },
        deps: {
          options: HTTP_CLIENT_AGENT_OPTIONS,
          interceptors: optional(HTTP_CLIENT_AGENT_INTERCEPTORS),
          loggerFactory: LOGGER_TOKEN,
          metrics: METRICS_MODULE_TOKEN,
        },
      }),
    httpProxyEnabled() && {
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: ({ loggerFactory, metrics }) =>
        function addHttpsProxy() {
          const logger = loggerFactory('http-proxy-agent');

          logger.debug({
            event: 'proxy agent enabled',
            proxyEnv: getHttpsProxy(),
            noProxyEnv: getNoProxy(),
          });

          addProxyToHttpsAgent({ logger, metrics });
        },
      deps: {
        loggerFactory: LOGGER_TOKEN,
        metrics: METRICS_MODULE_TOKEN,
      },
    },
  ].filter(Boolean),
})
export class HttpProxyAgentModule {}
