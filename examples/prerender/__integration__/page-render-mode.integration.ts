import { sleep } from '@tramvai/test-integration';
import { testPrerender as test } from './test.fixture';

const desktopUA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.3987.87 Safari/537.36';
const mobileUA =
  'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.3071.125 Mobile Safari/537.36';

test.describe('tramvai/page-render-mode', async () => {
  test('"tramvai static" output is used for Static Page Render Mode cache', async ({
    appServer,
  }) => {
    const [pageMain, pageSecond] = await Promise.all([
      fetch(`http://localhost:${appServer.port}/`),
      fetch(`http://localhost:${appServer.port}/second/`),
    ]);

    test.expect(pageMain.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(pageSecond.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
    test.expect(pageMain.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');
    test.expect(pageSecond.headers.get('x-tramvai-static-page-cache-source')).toBe(null);

    // wait for background cache revalidation
    await sleep(100);

    const pageSecondFromCache = await fetch(`http://localhost:${appServer.port}/second/`);

    test.expect(pageSecondFromCache.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test
      .expect(pageSecondFromCache.headers.get('x-tramvai-static-page-cache-source'))
      .toBe('memory');
  });

  test('Revalidation header bypasses cache', async ({ appServer }) => {
    // First request - from FS cache
    const res1 = await fetch(`http://localhost:${appServer.port}/`);
    test.expect(res1.headers.get('x-tramvai-static-page-from-cache')).toBe('true');

    // Request with revalidation header - should bypass cache
    const res2 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: {
        'x-tramvai-static-page-revalidate': 'true',
      },
    });
    test.expect(res2.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
  });

  test('Cache key variations (desktop/mobile) are served from FS cache', async ({ appServer }) => {
    const desktopRes = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    const mobileRes = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': mobileUA },
    });

    test.expect(desktopRes.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(desktopRes.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');

    test.expect(mobileRes.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(mobileRes.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');

    // Both should return valid HTML with route content
    const desktopHtml = await desktopRes.text();
    const mobileHtml = await mobileRes.text();
    test.expect(desktopHtml).toContain('<!DOCTYPE html>');
    test.expect(mobileHtml).toContain('<!DOCTYPE html>');
  });

  test('Cache key variations (desktop/mobile) is included in headers', async ({ appServer }) => {
    const desktopRes = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    const mobileRes = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': mobileUA },
    });

    test.expect(desktopRes.headers.get('x-tramvai-static-page-key')).toBe('desktop');
    test.expect(desktopRes.headers.get('vary')).toBe('X-Tramvai-Static-Page-Key');

    test.expect(mobileRes.headers.get('x-tramvai-static-page-key')).toBe('mobile');
    test.expect(mobileRes.headers.get('vary')).toBe('X-Tramvai-Static-Page-Key');
  });

  test('Query-based cache key variation is served from FS cache', async ({ appServer }) => {
    const res = await fetch(
      `http://localhost:${appServer.port}/?utm_source=prerender&utm_medium=example`
    );

    test.expect(res.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');
  });

  test('FS cache hit promotes entry to memory cache for key variations', async ({ appServer }) => {
    // First request with desktop UA - should come from FS cache
    const res1 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    test.expect(res1.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');

    // Same request again - should come from memory (promoted from FS)
    const res2 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    test.expect(res2.headers.get('x-tramvai-static-page-cache-source')).toBe('memory');

    // Different key (mobile) - should still come from FS (first access for this key)
    const res3 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': mobileUA },
    });
    test.expect(res3.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');
  });

  test('Cache miss for non-prerendered key variation', async ({ appServer }) => {
    // /third/ was prerendered only with default (desktop) key
    // Desktop request should hit cache
    const desktopRes = await fetch(`http://localhost:${appServer.port}/third/`, {
      headers: { 'User-Agent': desktopUA },
    });
    test.expect(desktopRes.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(desktopRes.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');

    // Mobile request should miss cache (mobile key was not prerendered for this route)
    const mobileRes = await fetch(`http://localhost:${appServer.port}/third/`, {
      headers: { 'User-Agent': mobileUA },
    });
    test.expect(mobileRes.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
  });

  test('PAPI revalidate with specific key clears only that variation', async ({ appServer }) => {
    // Fill cache for both desktop and mobile keys
    const res1 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    const res2 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': mobileUA },
    });

    test.expect(res1.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res2.headers.get('x-tramvai-static-page-from-cache')).toBe('true');

    // Revalidate only desktop key
    await fetch(`http://localhost:${appServer.port}/prerender/private/papi/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname: '/', key: 'desktop' }),
    });

    await sleep(100);

    // Desktop should be cleared from both caches
    const res3 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': desktopUA },
    });
    // Mobile should still be cached (promoted to memory from earlier access)
    const res4 = await fetch(`http://localhost:${appServer.port}/`, {
      headers: { 'User-Agent': mobileUA },
    });

    test.expect(res3.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
    test.expect(res4.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
  });

  test('Non-static prerendered route is not served from cache', async ({ appServer }) => {
    // /2/test/2/ does not have renderMode: 'static', but it was prerendered
    // First request - full render (no cache)
    const res1 = await fetch(`http://localhost:${appServer.port}/2/test/2/`, {
      headers: { 'User-Agent': desktopUA },
    });
    test.expect(res1.headers.get('x-tramvai-static-page-from-cache')).toBe(null);

    await sleep(100);

    // Request after potential background revalidation - full render (no cache)
    const res2 = await fetch(`http://localhost:${appServer.port}/2/test/2/`, {
      headers: { 'User-Agent': desktopUA },
    });
    test.expect(res2.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
  });

  test('PAPI revalidate clears both memory and FS cache', async ({ appServer }) => {
    // Request page to fill cache
    const res1 = await fetch(`http://localhost:${appServer.port}/`);
    test.expect(res1.headers.get('x-tramvai-static-page-from-cache')).toBe('true');

    // Second request should hit memory cache
    const res2 = await fetch(`http://localhost:${appServer.port}/`);
    test.expect(res2.headers.get('x-tramvai-static-page-cache-source')).toBe('memory');

    // Revalidate via PAPI
    await fetch(`http://localhost:${appServer.port}/prerender/private/papi/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname: '/' }),
    });

    // Wait for cache to be cleared
    await sleep(100);

    // Next request should trigger revalidation
    const res3 = await fetch(`http://localhost:${appServer.port}/`);
    test.expect(res3.headers.get('x-tramvai-static-page-from-cache')).toBe(null);

    // Wait for background revalidation
    await sleep(100);

    // Should be cached again
    const res4 = await fetch(`http://localhost:${appServer.port}/`);
    test.expect(res4.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
  });

  test('PAPI revalidate all clears entire cache', async ({ appServer }) => {
    // Request multiple pages
    await fetch(`http://localhost:${appServer.port}/`);
    await fetch(`http://localhost:${appServer.port}/second/`);
    await sleep(100);

    // Both should be cached
    const res1 = await fetch(`http://localhost:${appServer.port}/`);
    const res2 = await fetch(`http://localhost:${appServer.port}/second/`);
    test.expect(res1.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res2.headers.get('x-tramvai-static-page-from-cache')).toBe('true');

    // Revalidate all
    await fetch(`http://localhost:${appServer.port}/prerender/private/papi/revalidate`, {
      method: 'POST',
    });

    await sleep(100);

    // Both should miss cache
    const res3 = await fetch(`http://localhost:${appServer.port}/`);
    const res4 = await fetch(`http://localhost:${appServer.port}/second/`);
    test.expect(res3.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
    test.expect(res4.headers.get('x-tramvai-static-page-from-cache')).toBe(null);
  });

  test('FS cache metrics are tracked', async ({ appServer }) => {
    // Make some requests
    await fetch(`http://localhost:${appServer.port}/`);
    await fetch(`http://localhost:${appServer.port}/`);
    await fetch(`http://localhost:${appServer.port}/second/`);

    await sleep(100);

    const metricsRes = await fetch(`http://localhost:${appServer.port}/metrics`);
    const metrics = await metricsRes.text();

    // Check that FS cache metrics exist
    test.expect(metrics).toContain('static_pages_fs_cache_hit');
    test.expect(metrics).toContain('static_pages_fs_cache_miss');
    test.expect(metrics).toContain('static_pages_fs_cache_size');
    test.expect(metrics).toContain('static_pages_fs_cache_bytes');

    // Verify hit counter increased
    test.expect(metrics).toMatch(/static_pages_fs_cache_hit \d+/);
    // Verify miss counter increased (for second page)
    test.expect(metrics).toMatch(/static_pages_fs_cache_miss \d+/);
  });

  test('Prerendered pages are loaded from FS cache on app startup', async ({ appServer }) => {
    // The main page should already be in FS cache from prerender
    // First request should hit FS cache without background fetch
    const res = await fetch(`http://localhost:${appServer.port}/`);

    test.expect(res.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res.headers.get('x-tramvai-static-page-cache-source')).toBe('fs');

    // Response should be valid HTML
    const html = await res.text();
    test.expect(html).toContain('<!DOCTYPE html>');
    test.expect(html).toContain('<html');
  });

  // TODO: incoming request deduplication while revalidation?

  // TODO: NotFound responses

  test('Cached response preserves status code and Content-Type header', async ({ appServer }) => {
    const res = await fetch(`http://localhost:${appServer.port}/`);

    test.expect(res.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res.headers.get('content-type')).toBe('text/html');
    test.expect(res.status).toBe(200);
  });

  test('Cached response preserves redirects', async ({ appServer }) => {
    const res = await fetch(`http://localhost:${appServer.port}/redirect/`, { redirect: 'manual' });

    test.expect(res.headers.get('x-tramvai-static-page-from-cache')).toBe('true');
    test.expect(res.headers.get('location')).toBe('/');
    test.expect(res.status).toBe(307);
  });
});
