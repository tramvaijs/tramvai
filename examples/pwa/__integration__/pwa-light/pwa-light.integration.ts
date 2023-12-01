import { test } from './pwa-light-test-fixture';

test.describe('packages/modules/pwa-light', () => {
  test.describe('Service Worker', () => {
    test('should be registered with correct url', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/test`);
      test.expect(await Pwa.getSWUrl()).toBe('/sw.js');
    });

    test('should be registered with correct scope', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/test`);

      test.expect(await Pwa.getSWScope()).toBe('/test');
    });
  });

  test.describe('Webmanifest', () => {
    test('should be registered with correct url', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/test`);

      const url = await Pwa.getWebmanifestUrl();

      test.expect(/\/manifest\.webmanifest$/.test(url)).toBe(true);
    });

    test('proxy should work', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/test`);

      const content = await Pwa.fetchWebmanifest();

      test.expect(content.name).toBe('Tinkoff');
    });
  });
});
