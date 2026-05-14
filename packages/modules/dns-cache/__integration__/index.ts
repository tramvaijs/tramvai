// we need to monkeypatch `dns.lookup` before `cacheable-lookup` will save original version in closure,
// and before undici evaluates dns module (our custom lookup in dns-cache module reads dns.lookup at call time)
if (typeof window === 'undefined') {
  const { mapHostsToLocalIP } = require('./utils/dns');

  // include localhost to force IPv4-only resolution — prevents undici DNS interceptor
  // from picking IPv6 (::1) for internal app requests
  mapHostsToLocalIP(['dns-test.invalid', 'dns-seq-test.invalid', 'localhost']);
}

/* eslint-disable import/first */
import { commandLineListTokens, createApp, provide } from '@tramvai/core';
import { HttpClientModule, HTTP_CLIENT } from '@tramvai/module-http-client';
import { TramvaiDnsCacheModule } from '@tramvai/module-dns-cache';
import { ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/tokens-common';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
/* eslint-enable import/first */

createApp({
  name: 'dns-cache-app',
  modules: [...modules, HttpClientModule, TramvaiDnsCacheModule],
  providers: [
    provide({
      provide: commandLineListTokens.resolvePageDeps,
      useFactory: ({ pageService, httpClient, envManager }) => {
        return async function makeTestRequest() {
          if (typeof window === 'undefined') {
            const queryParams = pageService.getCurrentUrl().query;
            const baseUrl = envManager.get('TEST_API');
            const { dnsLookupCalls, resetDnsLookupCalls } = require('./utils/dns');
            const http = require('http');

            const httpRequest = (url: string): Promise<string> => {
              return new Promise((resolve, reject) => {
                http
                  .request(url, (res: any) => {
                    let data = '';
                    res.on('data', (chunk: string) => {
                      data += chunk;
                    });
                    res.on('end', () => resolve(data));
                  })
                  .on('error', reject)
                  .end();
              });
            };

            const requestType = queryParams.request;

            if (requestType === 'http-client') {
              await httpClient.request({ path: '/http-client/', baseUrl });
            }

            if (requestType === 'fetch') {
              await fetch(`${baseUrl}fetch/`);
            }

            if (requestType === 'http-request') {
              await httpRequest(`${baseUrl}http-request/`);
            }

            if (requestType === 'all-sequential') {
              const seqBaseUrl = envManager.get('TEST_API_SEQ');

              resetDnsLookupCalls();

              await httpClient.request({ path: '/http-client/', baseUrl: seqBaseUrl });
              await fetch(`${seqBaseUrl}fetch/`);

              const undiciLookupCount = dnsLookupCalls['dns-seq-test.invalid'] || 0;

              await httpRequest(`${seqBaseUrl}http-request/`);

              const totalLookupCount = dnsLookupCalls['dns-seq-test.invalid'] || 0;

              await httpRequest(`${seqBaseUrl}dns-stats/undici-lookup-count/${undiciLookupCount}/`);
              await httpRequest(`${seqBaseUrl}dns-stats/total-lookup-count/${totalLookupCount}/`);
            }
          }
        };
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
        httpClient: HTTP_CLIENT,
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      useValue: [{ key: 'TEST_API' }, { key: 'TEST_API_SEQ' }],
    }),
  ],
  bundles,
});
