import { test } from './same-url-test-fixture';
import { blockOnce, collectAssetErrors, getAssetErrors } from './utils';

test.describe('TramvaiRetryAssetsModule - retry to the same url (empty RETRY_HOSTNAME_MAP)', () => {
  test('a failed critical script is re-requested from the same url and executed', async ({
    page,
    appServer,
  }) => {
    // only the first request is blocked, so the retry to the same url succeeds
    const requested = await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    await test.step('the asset was requested exactly twice from the original host', () => {
      const attempts = requested.filter(
        (url) =>
          url.includes('retry-target.js') && url.includes(`localhost:${appServer.staticPort}`)
      );

      // the original request plus exactly one retry - the retry limit is 1, and nothing
      // re-requests the asset after the retry succeeds
      test.expect(attempts.length).toBe(2);
    });

    await test.step('the script content was executed after the retry', async () => {
      test.expect(await page.evaluate(() => (window as any).__retryTargetLoaded)).toBe(true);
    });
  });

  test('the retry url is equal to the original url', async ({ page, appServer }) => {
    await collectAssetErrors(page);
    await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    const errors = await getAssetErrors(page);
    const scriptError = errors.find(
      (error) => error.code === 'ASSET_LOAD_FAIL' && error.originalUrl?.includes('retry-target.js')
    );

    test.expect(scriptError).toBeDefined();
    test.expect(scriptError!.newUrl).toBe(scriptError!.originalUrl);
  });

  test('a permanently failing asset is retried only once', async ({ page, appServer }) => {
    // block both the original request and the retry
    const requested = await blockOnce(page, ['retry-target.js', 'retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    const attempts = requested.filter((url) => url.includes('retry-target.js'));

    await test.step('the original request and exactly one retry, no retry cycle', () => {
      test.expect(attempts.length).toBe(2);
    });

    await test.step('the asset was not recovered', async () => {
      test.expect(await page.evaluate(() => (window as any).__retryTargetLoaded)).toBeUndefined();
    });
  });
});
