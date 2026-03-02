import { test } from './etag-test-fixture';

test.describe('packages/modules/server/etag', () => {
  test('should add ETag header to response', async ({ app }) => {
    const response = await app.request('/');

    test.expect(response.status).toBe(200);
    test.expect(response.headers.etag).toBeDefined();
    test.expect(response.headers.etag).toMatch(/^"[a-z0-9]+"$/);
  });

  test('should return consistent ETag for the same page', async ({ app }) => {
    const response1 = await app.request('/');
    const response2 = await app.request('/');

    test.expect(response1.headers.etag).toBeDefined();
    test.expect(response1.headers.etag).toBe(response2.headers.etag);
  });

  test('should return different ETags for different pages', async ({ app }) => {
    const response1 = await app.request('/');
    const response2 = await app.request('/test/');

    test.expect(response1.headers.etag).toBeDefined();
    test.expect(response2.headers.etag).toBeDefined();
    test.expect(response1.headers.etag).not.toBe(response2.headers.etag);
  });

  test('should return 304 when If-None-Match matches ETag', async ({ app }) => {
    const response = await app.request('/');
    const { etag } = response.headers;

    test.expect(etag).toBeDefined();

    const cachedResponse = await app.request('/', {
      headers: { 'if-none-match': etag },
    });

    test.expect(cachedResponse.status).toBe(304);
  });

  test('should return 200 when If-None-Match does not match ETag', async ({ app }) => {
    const response = await app.request('/', {
      headers: { 'if-none-match': '"nonexistent"' },
    });

    test.expect(response.status).toBe(200);
    test.expect(response.headers.etag).toBeDefined();
  });

  test('should return 304 when If-None-Match has W/ prefix matching strong ETag', async ({
    app,
  }) => {
    const response = await app.request('/');
    const { etag } = response.headers;

    test.expect(etag).toBeDefined();

    const cachedResponse = await app.request('/', {
      headers: { 'if-none-match': `W/${etag}` },
    });

    test.expect(cachedResponse.status).toBe(304);
  });
});
