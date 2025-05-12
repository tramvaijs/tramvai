import { test } from './test-fixture';

test.describe('ASSETS_PREFIX', () => {
  test('default ASSETS_PREFIX', async ({ page, appServer }) => {
    const assets: string[] = [];

    page.route('**/*', async (route) => {
      const url = route.request().url();

      if (url.startsWith(`http://localhost:${appServer.staticPort}/`)) {
        assets.push(url);
      }
      return route.continue();
    });

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    test.expect(assets.length).toBe(5);
  });

  test('custom ASSETS_PREFIX', async ({ page, appServer, proxyApp }) => {
    const assets: string[] = [];

    page.route('**/*', async (route) => {
      const url = route.request().url();

      if (url.startsWith(`http://localhost:${proxyApp.port}/`)) {
        assets.push(url);
      }
      return route.continue();
    });

    await page.goto(`http://localhost:${appServer.port}/?customAssetsPrefix=true`, {
      waitUntil: 'networkidle',
    });

    test.expect(assets.length).toBe(5);
  });
});
