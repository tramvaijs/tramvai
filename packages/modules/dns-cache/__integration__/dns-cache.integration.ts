import { test } from './test-fixture';

/**
 * How this test works
 *
 * 1. Start a mock HTTP server on a dynamic port (`apiServerFixture`)
 * 2. Monkeypatch `dns.lookup` in the test application process to resolve `dns-test.invalid` → `127.0.0.1`
 * 3. The test app makes HTTP requests to `http://dns-test.invalid:{port}/` via different mechanisms
 * 4. DNS cache module has two independent caches:
 *    - Undici DNS interceptor cache: used by `httpClient` and global `fetch` (via undici global dispatcher)
 *    - CacheableLookup cache: used by `http.request` (via http.Agent.prototype.createConnection monkeypatch)
 */
test.describe('packages/modules/dns-cache', () => {
  test.beforeEach(({ apiServer }) => {
    apiServer.clearUrls();
  });

  test('httpClient request resolves through DNS cache', async ({ app, I, apiServer }) => {
    await I.gotoPage(app.serverUrl, '?request=http-client');

    test.expect(apiServer.getUrls()).toEqual(['/http-client/']);
  });

  test('global fetch request resolves through DNS cache', async ({ app, I, apiServer }) => {
    await I.gotoPage(app.serverUrl, '?request=fetch');

    test.expect(apiServer.getUrls()).toEqual(['/fetch/']);
  });

  test('http.request resolves through DNS cache (cacheable-lookup path)', async ({
    app,
    I,
    apiServer,
  }) => {
    await I.gotoPage(app.serverUrl, '?request=http-request');

    test.expect(apiServer.getUrls()).toEqual(['/http-request/']);
  });

  // TODO: unskip in TCORE-5509
  // this test MUST be last - it verifies cache sharing with empty caches (dns.lookup call counting),
  // and after all-sequential, the undici connection pool state may affect subsequent individual requests
  test.skip('httpClient and fetch share undici DNS cache, http.request uses independent cache', async ({
    app,
    I,
    apiServer,
  }) => {
    await I.gotoPage(app.serverUrl, '?request=all-sequential');

    const urls = apiServer.getUrls();

    test.expect(urls).toContain('/http-client/');
    test.expect(urls).toContain('/fetch/');
    test.expect(urls).toContain('/http-request/');

    // dns-seq-test.invalid is a separate hostname not cached by individual tests above,
    // so dns.lookup calls accurately reflect fresh cache behavior
    //
    // undici-lookup-count/1/ means dns.lookup was called once for both httpClient and fetch (shared undici cache)
    test.expect(urls).toContain('/dns-stats/undici-lookup-count/1/');
    // total-lookup-count/3/ means http.request triggered 2 more dns.lookup calls via cacheable-lookup
    // (independent cache; cacheable-lookup calls dns.lookup twice - once for IPv4 and once for IPv6 fallback)
    test.expect(urls).toContain('/dns-stats/total-lookup-count/3/');
  });
});
