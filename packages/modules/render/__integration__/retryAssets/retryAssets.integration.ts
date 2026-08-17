import { test } from './test-fixture';
import { blockOnce, collectAssetErrors, getAssetErrors } from './utils';

test.describe('TramvaiRetryAssetsModule - retry to another host', () => {
  test('failed critical script is retried from the fallback CDN and executed', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    await test.step('the retry request went to the fallback CDN', () => {
      test.expect(fallbackCdn.requests.some((url) => url.includes('retry-target.js'))).toBe(true);
    });

    await test.step('the script content was executed after the retry', async () => {
      test.expect(await page.evaluate(() => (window as any).__retryTargetLoaded)).toBe(true);
    });
  });

  test('failed critical stylesheet is retried from the fallback CDN and applied', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    await blockOnce(page, ['retry-target.css']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    await test.step('the retry request went to the fallback CDN', () => {
      test.expect(fallbackCdn.requests.some((url) => url.includes('retry-target.css'))).toBe(true);
    });

    await test.step('the fallback link tag points to the fallback CDN', async () => {
      const href = await page.getAttribute(`link[data-href*="retry-target.css"]`, 'href');

      test.expect(href).toContain(`localhost:${fallbackCdn.port}`);
    });
  });

  test('the fallback tag keeps the original url and marks a successful retry', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    test.expect(fallbackCdn.requests.length).toBeGreaterThan(0);

    const tag = page.locator('script[data-src*="retry-target.js"]');

    await test.step('`data-src` keeps the original url, for monitoring reconciliation', async () => {
      test
        .expect(await tag.getAttribute('data-src'))
        .toContain(`localhost:${appServer.staticPort}`);
    });

    await test.step('`loaded` attribute marks the successful retry', async () => {
      test.expect(await tag.getAttribute('loaded')).toBe('true');
    });
  });

  test('`integrity` and `data-*` attributes are copied to the fallback tag', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    test.expect(fallbackCdn.requests.length).toBeGreaterThan(0);

    const tag = page.locator('script[data-src*="retry-target.js"]');

    await test.step('`integrity` is copied, though it does not work for an inline script', async () => {
      test.expect(await tag.getAttribute('integrity')).toBe('sha256-test');
    });

    await test.step('`data-*` attributes are copied', async () => {
      test.expect(await tag.getAttribute('data-test')).toBe('test');
    });
  });

  test('an ASSET_LOAD_FAIL error is thrown for a successful retry', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    await collectAssetErrors(page);
    await blockOnce(page, ['retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    const errors = await getAssetErrors(page);
    const scriptError = errors.find(
      (error) => error.code === 'ASSET_LOAD_FAIL' && error.originalUrl?.includes('retry-target.js')
    );

    await test.step('the error carries the retry protocol fields', () => {
      test.expect(scriptError).toBeDefined();
      test.expect(scriptError!.retry).toBe('success');
    });

    await test.step('`newUrl` points to the fallback CDN', () => {
      test.expect(scriptError!.newUrl).toContain(`localhost:${fallbackCdn.port}`);
    });
  });

  test('an asset without `data-critical` is not retried', async ({ page, appServer }) => {
    const requested = await blockOnce(page, ['non-critical.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // asserted on the requests intercepted by playwright, and not on `fallbackCdn.requests`:
    // the blocked request is fulfilled by playwright and never reaches the fallback CDN proxy,
    // so the proxy would report `0` requests for this asset even if a retry did happen
    await test.step('the asset was requested exactly once, without a retry', () => {
      const attempts = requested.filter((url) => url.includes('non-critical.js'));

      test.expect(attempts.length).toBe(1);
    });

    await test.step('the asset was not recovered', async () => {
      test.expect(await page.evaluate(() => (window as any).__nonCriticalLoaded)).toBeUndefined();
    });
  });

  test('a permanently failing stylesheet marks the fallback link and cleans it up', async ({
    page,
    appServer,
  }) => {
    await collectAssetErrors(page);
    // block the original request and the retry, so the `retryLink` error branch is taken
    await blockOnce(page, ['retry-target.css', 'retry-target.css']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    await test.step('an ASSET_LOAD_FAIL error is thrown with `retry: failed`', async () => {
      const errors = await getAssetErrors(page);
      const styleError = errors.find(
        (error) =>
          error.code === 'ASSET_LOAD_FAIL' && error.originalUrl?.includes('retry-target.css')
      );

      test.expect(styleError).toBeDefined();
      test.expect(styleError!.retry).toBe('failed');
    });

    // the failed fallback link is removed and its `data-href` deleted, so
    // mini-css-extract-plugin is able to request the same chunk again later
    await test.step('the fallback link is removed from the document', async () => {
      await test.expect(page.locator('link[href*="retry-target.css"]')).toHaveCount(0);
    });

    await test.step('no `data-href` is left pointing at the failed stylesheet', async () => {
      await test.expect(page.locator('link[data-href*="retry-target.css"]')).toHaveCount(0);
    });
  });

  test('an asset served from `assetsPrefix` is retried without `data-critical`', async ({
    page,
    appServer,
  }) => {
    await collectAssetErrors(page);

    const requested = await blockOnce(page, []);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // The tag is injected at runtime, so it carries neither `data-critical` (added by the server
    // for SSR assets) nor `data-webpack` (added by the webpack runtime). It is retried only
    // thanks to the `assetsPrefix` branch of `isCriticalAsset`.
    //
    // The file does not need to exist: the assertion is that a retry was *attempted*, which is
    // exactly what the criticality check controls. Injecting per test instead of adding a
    // permanently failing asset to the app keeps the other tests free of extra errors.
    //
    // The prefix is derived from an already rendered chunk instead of being hardcoded, so the
    // test does not silently break if the fixture changes the assets layout.
    await page.evaluate(() => {
      const chunk = Array.from(document.querySelectorAll('script[src]')).find((tag) =>
        (tag as HTMLScriptElement).src.includes('.chunk.js')
      ) as HTMLScriptElement;

      const prefix = chunk.src.slice(0, chunk.src.lastIndexOf('/') + 1);
      const script = document.createElement('script');

      script.src = `${prefix}prefixed-target.js`;
      document.head.appendChild(script);
    });

    await page.waitForFunction(() =>
      ((window as any).__assetErrors ?? []).some((error: any) =>
        error.originalUrl?.includes('prefixed-target.js')
      )
    );

    await test.step('the asset was requested twice - the original request and a retry', () => {
      const attempts = requested.filter((url) => url.includes('prefixed-target.js'));

      test.expect(attempts.length).toBe(2);
    });

    await test.step('the error reports a failed retry for the prefixed asset', async () => {
      const errors = await getAssetErrors(page);
      const error = errors.find((item) => item.originalUrl?.includes('prefixed-target.js'));

      test.expect(error!.code).toBe('ASSET_LOAD_FAIL');
      test.expect(error!.retry).toBe('failed');
    });
  });

  // The fallback tag of a permanently failed script must stay in the document: `loaded="error"`
  // together with the copied `data-src` is the contract other packages read.
  // `@tramvai/module-loader-client` finds a child app tag by `data-src` and branches on `loaded`
  // to tell "recovered by a retry" from "has to be requested again", and application monitoring
  // reconciles its `critical-assets-*` events through the same attributes. Removing the tag makes
  // both of them see a missing asset as if it had never been attempted.
  test('the fallback tag of a permanently failed script is kept and marked as failed', async ({
    page,
    appServer,
  }) => {
    await collectAssetErrors(page);
    // block the original request and the retry, so the script failure branch is taken
    await blockOnce(page, ['retry-target.js', 'retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // the tag is removed inside a `setTimeout`, so wait for the error that is thrown from the
    // same task before asserting - otherwise the assertions could pass before a removal happens
    await page.waitForFunction(() =>
      ((window as any).__assetErrors ?? []).some(
        (error: any) => error.retry === 'failed' && error.originalUrl?.includes('retry-target.js')
      )
    );

    const tag = page.locator('script[data-src*="retry-target.js"]');

    await test.step('the fallback tag is still in the document', async () => {
      await test.expect(tag).toHaveCount(1);
    });

    await test.step('`loaded` marks the failed retry', async () => {
      test.expect(await tag.getAttribute('loaded')).toBe('error');
    });

    await test.step('`integrity` and `data-*` attributes are still readable', async () => {
      test.expect(await tag.getAttribute('integrity')).toBe('sha256-test');
      test.expect(await tag.getAttribute('data-test')).toBe('test');
    });

    await test.step('the asset was not recovered', async () => {
      test.expect(await page.evaluate(() => (window as any).__retryTargetLoaded)).toBeUndefined();
    });
  });

  // The tag is kept, so it must not be adopted by the webpack chunk loading runtime, which looks
  // an existing tag up by `src` or `data-webpack`. The fallback is an inline script without `src`,
  // and `applyCommonAttributes` does not propagate `data-webpack` / `data-rspack`, so the runtime
  // cannot match it and will not attach stale handlers.
  test('a permanently failed fallback script is not discoverable by the webpack runtime', async ({
    page,
    appServer,
  }) => {
    await collectAssetErrors(page);

    const requested = await blockOnce(page, []);

    // `data-webpack` is set by the webpack runtime for chunks it loads itself (in addition to
    // `data-critical` added by ScriptCriticalAttributePlugin). Both are reproduced here so the
    // injected tag matches what the real webpack runtime would create. The url does not exist,
    // so both the original request and the retry fail and the failure branch is taken.
    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    await page.evaluate((staticPort) => {
      const script = document.createElement('script');

      script.src = `http://localhost:${staticPort}/public/webpack-chunk-target.js`;
      script.dataset.critical = 'true';
      script.dataset.webpack = 'retry-assets:chunk';
      document.head.appendChild(script);
    }, appServer.staticPort);

    await page.waitForFunction(() =>
      ((window as any).__assetErrors ?? []).some(
        (error: any) =>
          error.retry === 'failed' && error.originalUrl?.includes('webpack-chunk-target.js')
      )
    );

    await test.step('the fallback tag is kept with the original url in `data-src`', async () => {
      await test.expect(page.locator('script[data-src*="webpack-chunk-target.js"]')).toHaveCount(1);
    });

    await test.step('`data-webpack` is not propagated, so the webpack runtime ignores the dead tag', async () => {
      await test
        .expect(page.locator('script[data-src*="webpack-chunk-target.js"][data-webpack]'))
        .toHaveCount(0);
    });

    await test.step('the retry really happened for the webpack marked asset', () => {
      const attempts = requested.filter((url) => url.includes('webpack-chunk-target.js'));

      test.expect(attempts.length).toBe(2);
    });
  });

  test('a runtime-loaded chunk script (ScriptCriticalAttributePlugin) is retried when it fails during SPA navigation', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    // collectAssetErrors must come before page.goto (it uses page.addInitScript)
    await collectAssetErrors(page);

    // Initial load: root.chunk.js is loaded here; test.chunk.js is not (separate lazy bundle)
    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // Set up blocking AFTER the initial load so root.chunk.js (already cached by webpack) is
    // never matched. The first '.chunk.js' request during SPA is test.HASH.chunk.js, loaded by
    // webpack's __webpack_require__.l — ScriptCriticalAttributePlugin sets data-critical="true"
    // on that script before it is appended to head, so isCriticalAsset returns true on failure.
    await blockOnce(page, ['.chunk.js']);

    // SPA-navigate to /test/; webpack runtime fires the chunk-loading code for test.chunk.js
    await page.evaluate(() =>
      (window as any).contextExternal.di.get('router pageService').navigate('/test/')
    );

    // retryScript re-throws ASSET_LOAD_FAIL after the sync XHR retry; wait for it
    await page.waitForFunction(() =>
      ((window as any).__assetErrors ?? []).some((error: any) =>
        error.originalUrl?.includes('.chunk.js')
      )
    );

    await test.step('the retry request went to the fallback CDN', () => {
      test.expect(fallbackCdn.requests.some((url) => url.includes('.chunk.js'))).toBe(true);
    });

    await test.step('the test page rendered after the successful retry', async () => {
      await test.expect(page.locator('body')).toContainText('test page');
    });
  });

  test('a runtime-loaded CSS chunk (mini-css-extract-plugin) is retried when it fails during SPA navigation', async ({
    page,
    appServer,
    fallbackCdn,
  }) => {
    // Initial load: root.chunk.css is loaded here; test.chunk.css is not (separate lazy bundle)
    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // Set up blocking AFTER the initial load so root.chunk.css (already loaded) is never matched.
    // The first '.chunk.css' request during SPA is test.HASH.chunk.css, loaded by
    // mini-css-extract-plugin's runtime with data-critical="true" from the `attributes` config.
    await blockOnce(page, ['.chunk.css']);

    // SPA-navigate to /test/; mini-css-extract-plugin fires the CSS chunk-loading code
    await page.evaluate(() =>
      (window as any).contextExternal.di.get('router pageService').navigate('/test/')
    );

    // retryLink creates <link data-href="...HASH.chunk.css" href="...fallback-cdn..."> synchronously
    await page.waitForSelector('link[data-href*=".chunk.css"]', { state: 'attached' });

    // Wait for the fallback link to finish loading so the CDN request is definitely recorded
    await page.waitForFunction(() => {
      const link = document.querySelector('link[data-href*=".chunk.css"]');

      return !!link?.getAttribute('loaded');
    });

    await test.step('the retry request went to the fallback CDN', () => {
      test.expect(fallbackCdn.requests.some((url) => url.includes('.chunk.css'))).toBe(true);
    });

    await test.step('the fallback link tag points to the fallback CDN', async () => {
      const href = await page.getAttribute(`link[data-href*=".chunk.css"]`, 'href');

      test.expect(href).toContain(`localhost:${fallbackCdn.port}`);
    });
  });

  test('an asset is retried only once', async ({ page, appServer }) => {
    // block two requests in a row - the original one and the retry - so the retry fails too
    const requested = await blockOnce(page, ['retry-target.js', 'retry-target.js']);

    await page.goto(`http://localhost:${appServer.port}/`, { waitUntil: 'networkidle' });

    // asserted on the requests intercepted by playwright, and not on `fallbackCdn.requests`:
    // blocked requests are fulfilled by playwright and never reach the fallback CDN proxy,
    // so the proxy would report `0` requests and the assertion would pass even without any
    // retry limit at all
    const attempts = requested.filter((url) => url.includes('retry-target.js'));

    await test.step('the original request and exactly one retry, no retry cycle', () => {
      test.expect(attempts.length).toBe(2);
    });

    await test.step('the asset was not recovered', async () => {
      test.expect(await page.evaluate(() => (window as any).__retryTargetLoaded)).toBeUndefined();
    });
  });
});
