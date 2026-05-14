import { test } from './test-fixture';

/**
 * How this test works
 *
 * 1. Start https fake API server (`apiServerFixture`) on a dynamic port
 * 2. Start http proxy server for CONNECT method (`proxyServerFixture`)
 * 3. Monkeypatch `dns.lookup` in test and application processes to resolve fake domains to `127.0.0.1`
 * 4. Add HTTPS_PROXY and NO_PROXY envs
 * 5. TramvaiDnsCacheModule is included to test coexistence with http-proxy-agent
 *    (undici DNS interceptor is automatically excluded from EnvHttpProxyAgent due to incompatibility)
 *
 * On page load, for proxied response:
 * 1. We make request to fake API domain `proxied.mylocalhost.com:{port}`
 * 2. EnvHttpProxyAgent checks hostname against NO_PROXY — not matched — routes through proxy
 * 3. Proxy server gets CONNECT `proxied.mylocalhost.com:{port}`, resolves via dns.lookup mock, pipes to API server
 *
 * On page load, for non-proxied response:
 * 1. We make request to fake API domain `non-proxied.mylocalhost.com:{port}`
 * 2. EnvHttpProxyAgent checks hostname against NO_PROXY — matched — direct connection
 * 3. Request resolved to `127.0.0.1` via dns.lookup mock, goes directly to API server
 */
test.describe('packages/modules/http-proxy-agent', () => {
  test.beforeEach(({ apiServer, proxyServer }) => {
    proxyServer.clearUrls();
    apiServer.clearUrls();
  });

  test('Check that HTTP_PROXY is work', async ({ app, I, apiServer, proxyServer }) => {
    await I.gotoPage(app.serverUrl, '?send-proxied-request');

    const apiPort = apiServer.getPort();

    test
      .expect(proxyServer.getUrls())
      .toEqual([`proxied.mylocalhost.com:${apiPort}`, `proxied.mylocalhost.com:${apiPort}`]);
    test.expect(apiServer.getUrls()).toEqual(['/proxied/', '/proxied-fetch/']);
  });

  test('Check that NO_PROXY is work', async ({ app, I, apiServer, proxyServer }) => {
    await I.gotoPage(app.serverUrl, '?send-non-proxied-request');

    test.expect(proxyServer.getUrls()).toEqual([]);
    test.expect(apiServer.getUrls()).toEqual(['/non-proxied/', '/non-proxied-fetch/']);
  });
});
