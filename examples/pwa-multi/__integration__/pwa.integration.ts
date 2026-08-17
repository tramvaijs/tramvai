import { test } from './test-fixture';

test.describe('packages/modules/pwa-multi', () => {
  test.describe('Multiple Service Workers', () => {
    test('should register scope SW with correct url and scope', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      test.expect(await Pwa.getSWUrl('/scope/')).toBe('/scope/service-worker.js');
      test.expect(await Pwa.getSWScope('/scope/')).toBe('/scope/');
    });

    test('should register bank SW with correct url and scope', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/bank/`);

      test.expect(await Pwa.getSWUrl('/bank/')).toBe('/bank/service-worker-bank.js');
      test.expect(await Pwa.getSWScope('/bank/')).toBe('/bank/');
    });

    test('should have both SW registered when visiting both scopes', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);
      await Pwa.waitForSWRegistration('/scope/');

      await I.gotoPage(`${app.serverUrl}/bank/`);
      await Pwa.waitForSWRegistration('/bank/');

      const registrations = await Pwa.getAllSWRegistrations();

      test.expect(registrations).toHaveLength(2);
      test.expect(registrations).toContainEqual({
        url: '/scope/service-worker.js',
        scope: '/scope/',
      });
      test.expect(registrations).toContainEqual({
        url: '/bank/service-worker-bank.js',
        scope: '/bank/',
      });
    });

    test('should select correct SW based on pathname', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/page`);
      const scopeSW = await Pwa.getSWUrl('/scope/');
      test.expect(scopeSW).toBe('/scope/service-worker.js');

      await I.gotoPage(`${app.serverUrl}/bank/page`);
      const bankSW = await Pwa.getSWUrl('/bank/');
      test.expect(bankSW).toBe('/bank/service-worker-bank.js');
    });

    test('should respect custom swResolve function', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/custom`);

      test.expect(await Pwa.isSwExistsOnPage()).toBeFalsy();
    });
  });

  test.describe('Webmanifest', () => {
    test('should be registered with correct url for /scope/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      const url = await Pwa.getWebmanifestUrl();

      test.expect(/\/scope\/manifest\.webmanifest$/.test(url)).toBe(true);
    });

    test('proxy should work', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      const content = await Pwa.fetchWebmanifest();

      test.expect(content.name).toBe('my manifest');
    });

    test('should be registered with correct url for /bank/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/bank/`);

      const url = await Pwa.getWebmanifestUrl();

      test.expect(/\/bank\/manifest-bank\.webmanifest$/.test(url)).toBe(true);
    });
  });

  test.describe('Meta', () => {
    test('should contain theme-color for scope /scope/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      test.expect(await Pwa.getThemeColor()).toBe('#ffdd2d');
    });

    test('should contain viewport for scope /scope/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      test.expect(await Pwa.getViewport()).toBe('width=device-width, initial-scale=1');
    });

    test('should contain theme-color for scope /bank/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/bank/`);

      test.expect(await Pwa.getThemeColor()).toBe('#ffffff');
    });

    test('should contain viewport-fit for scope /bank/', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/bank/`);

      test.expect(await Pwa.getViewport()).toBe('viewport-fit=cover');
    });
  });

  test.describe('PWA recipes', () => {
    test('should cache static assets and pages', async ({ app, I, Pwa }) => {
      await I.gotoPage(`${app.serverUrl}/scope/`);

      const swResponses = await Pwa.getSWResponsesAfterReload();

      test
        .expect(
          swResponses
            .map((response) =>
              response
                .url()
                .replace(app.serverUrl, `\${SERVER_URL}`)
                .replace(app.staticUrl, `\${STATIC_URL}`)
            )
            .sort()
        )
        .toEqual([
          `\${SERVER_URL}/scope/`,
          `\${STATIC_URL}/dist/client/@_routes_scope_index.chunk.js`,
          `\${STATIC_URL}/dist/client/platform.js`,
          `\${STATIC_URL}/dist/client/react.js`,
          `\${STATIC_URL}/dist/client/runtime.js`,
          `\${STATIC_URL}/dist/client/tramvai-workbox-window.chunk.js`,
          `\${STATIC_URL}/dist/client/tramvai.js`,
        ]);
    });
  });
});
