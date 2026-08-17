/* eslint-disable max-nested-callbacks */
import { test } from './test-fixture';

test.describe('tinkoff-examples/simple-app-pwa/monitoring', () => {
  test.describe('Application start with errors', () => {
    test('Correct monitoring events are sent on errors during application start', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple-with-error/`);

      await test.step('Wait for the critical-assets-load-failed event after a critical asset fails to load', async () => {
        await page.waitForFunction(() => {
          return (window as any)['critical-assets-load-failed'] === true;
        });
        await page.waitForFunction(() => {
          return !(window as any)['critical-assets-loaded'];
        });
      });

      await test.step('The critical-assets-load-failed payload contains the url of the failed asset', async () => {
        const event = await page.evaluate(() =>
          (window as any).__monitoringEvents.find(
            (e: any) => e.eventName === 'critical-assets-load-failed'
          )
        );

        test
          .expect(event.urls)
          .toEqual(
            test.expect.arrayContaining([
              test.expect.stringContaining('https://example.com/non-existent.js'),
            ])
          );
      });

      await test.step('The asset-load-failed event is sent with the ASSET_LOAD_FAIL code', async () => {
        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'asset-load-failed')
        );

        test.expect(events.length).toBeGreaterThan(0);
        test.expect(events[0].error.code).toBe('ASSET_LOAD_FAIL');
        test.expect(events[0].error.originalUrl).toContain('https://example.com/non-existent.js');
      });
    });

    test('The critical-assets-load-failed event is sent for a failed critical CSS', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/failed-critical-css/`);

      await test.step('Wait for the critical-assets-load-failed event', async () => {
        await page.waitForFunction(() => {
          return (window as any)['critical-assets-load-failed'] === true;
        });
      });

      await test.step('The payload contains the url of the failed CSS', async () => {
        const event = await page.evaluate(() =>
          (window as any).__monitoringEvents.find(
            (e: any) => e.eventName === 'critical-assets-load-failed'
          )
        );

        test
          .expect(event.urls)
          .toEqual(
            test.expect.arrayContaining([
              test.expect.stringContaining('https://example.com/non-existent.css'),
            ])
          );
      });
    });

    test('A non-critical asset failure does not affect the critical-assets-* events', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/failed-non-critical-asset/`);

      await test.step('The critical-assets-loaded event is sent, because the failed asset is not critical', async () => {
        await page.waitForFunction(() => {
          return (window as any)['critical-assets-loaded'] === true;
        });
        await page.waitForFunction(() => {
          return !(window as any)['critical-assets-load-failed'];
        });
      });
    });

    // checks the reconciliation in errorMonitoringScript: a failed critical asset gets into
    // `failedCriticalAssets`, but a successful retry replaces the tag with a fallback that has
    // `loaded="true"`, and on the `load` event the asset is removed from the failed set
    test('A successful retry of a critical asset leads to the critical-assets-loaded event', async ({
      page,
      app,
      I,
    }) => {
      let attempts = 0;

      // the first request fails, the retry to the same url returns a working script
      await page.route('**/retried-critical-asset.js', (route) => {
        attempts += 1;

        if (attempts === 1) {
          return route.fulfill({ status: 500, contentType: 'text/plain', body: 'Error' });
        }

        return route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: 'window.__retriedAssetLoaded = true;',
        });
      });

      await I.gotoPage(`${app.serverUrl}/retried-critical-asset/`);

      await test.step('The asset is requested twice and recovered after the retry', async () => {
        await page.waitForFunction(() => (window as any).__retriedAssetLoaded === true);

        test.expect(attempts).toBe(2);
      });

      await test.step('The asset-load-failed event is sent with retry: success', async () => {
        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'asset-load-failed')
        );

        test.expect(events.length).toBe(1);
        test.expect(events[0].error.code).toBe('ASSET_LOAD_FAIL');
        test.expect(events[0].error.retry).toBe('success');
      });

      await test.step('The critical-assets-loaded event is sent, because the asset was recovered', async () => {
        await page.waitForFunction(() => {
          return (window as any)['critical-assets-loaded'] === true;
        });

        test
          .expect(await page.evaluate(() => (window as any)['critical-assets-load-failed']))
          .toBeUndefined();
      });
    });

    test('A failed retry of a critical asset leads to the critical-assets-load-failed event', async ({
      page,
      app,
      I,
    }) => {
      let attempts = 0;

      // both the original request and the retry fail
      await page.route('**/retried-critical-asset.js', (route) => {
        attempts += 1;

        return route.fulfill({ status: 500, contentType: 'text/plain', body: 'Error' });
      });

      await I.gotoPage(`${app.serverUrl}/retried-critical-asset/`);

      await test.step('The asset-load-failed event is sent with retry: failed', async () => {
        await page.waitForFunction(() => {
          return ((window as any).__monitoringEvents ?? []).some(
            (e: any) => e.eventName === 'asset-load-failed'
          );
        });

        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'asset-load-failed')
        );

        test.expect(events[0].error.retry).toBe('failed');
      });

      await test.step('The asset is requested twice - the original request and one retry', () => {
        test.expect(attempts).toBe(2);
      });

      await test.step('The critical-assets-load-failed payload contains the url of the failed asset', async () => {
        await page.waitForFunction(() => {
          return (window as any)['critical-assets-load-failed'] === true;
        });

        const event = await page.evaluate(() =>
          (window as any).__monitoringEvents.find(
            (e: any) => e.eventName === 'critical-assets-load-failed'
          )
        );

        test
          .expect(event.urls)
          .toEqual(
            test.expect.arrayContaining([
              test.expect.stringContaining('/retried-critical-asset.js'),
            ])
          );

        test
          .expect(await page.evaluate(() => (window as any)['critical-assets-loaded']))
          .toBeUndefined();
      });
    });
    test('The unhandled-rejection event is sent for an unhandled promise rejection', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      await page.evaluate(() => {
        Promise.reject(new Error('Unhandled rejection example'));
      });

      await test.step('The unhandled-rejection event is sent', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['unhandled-rejection'] === true;
        });

        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter(
            (e: any) => e.eventName === 'unhandled-rejection'
          )
        );

        test.expect(events.length).toBeGreaterThan(0);
        test.expect(events[0].error.message).toBe('Unhandled rejection example');
      });
    });

    test('The unhandled-error event is sent', async ({ page, app, I }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      await page.evaluate(() => {
        const error = new Error('Unhandled error example');
        window.dispatchEvent(new ErrorEvent('error', { error }));
      });

      await test.step('The unhandled-error event is sent', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['unhandled-error'] === true;
        });

        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'unhandled-error')
        );

        test.expect(events.length).toBeGreaterThan(0);
        test.expect(events[0].error.message).toBe('Unhandled error example');
      });
    });

    test('The app-start-failed event is sent on an application initialization error', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/?breakAppCreation=true`);

      await test.step('The app-start-failed event is sent, not unhandled-error', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['app-start-failed'] === true;
        });

        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'app-start-failed')
        );

        test.expect(events.length).toBe(1);
        test.expect(events[0].error.appCreationError).toBe(true);

        test.expect(await page.evaluate(() => (window as any)['unhandled-error'])).toBeUndefined();
      });

      await test.step('The error reports an invalid provider', async () => {
        const events = await page.evaluate(() =>
          (window as any).__monitoringEvents.filter((e: any) => e.eventName === 'app-start-failed')
        );

        test.expect(events[0].error.message).toContain('Invalid provider');
      });

      await test.step('The application really did not start', async () => {
        test.expect(await page.evaluate(() => (window as any).appInit)).toBeUndefined();
      });
    });

    test('An application initialization error leads to app:initialize-failed', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple-with-fail-token`);
      await page.waitForFunction(() => {
        return (window as any)?.appInitFailed === true;
      });
    });
    test('Correct monitoring events on hydration errors', async ({ I, page, app }) => {
      await I.gotoPage(`${app.serverUrl}/simple?error=true`);
      await page.waitForFunction(() => {
        return (window as any).errorBoundary === true;
      });
      await page.waitForFunction(() => {
        return (window as any).appRenderFailed === true && !(window as any)?.appRendered;
      });
    });
  });
  test.describe('Successful application start', () => {
    test('Correct monitoring events are sent on a successful application start', async ({
      page,
      app,
      I,
      App,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      await test.step('Wait for the html-opened event', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['html-opened'] === true;
        });
      });

      await test.step('Wait for the critical-assets-loaded event', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['critical-assets-loaded'] === true;
        });
      });

      await test.step('The critical-assets-load-failed event is not sent', async () => {
        test
          .expect(await page.evaluate(() => (window as any)['critical-assets-load-failed']))
          .toBeUndefined();
      });

      await test.step('The critical-assets-loaded event is sent once per page session', async () => {
        const count = await page.evaluate(
          () =>
            (window as any).__monitoringEvents.filter(
              (e: any) => e.eventName === 'critical-assets-loaded'
            ).length
        );

        test.expect(count).toBe(1);
      });

      await test.step('Wait for the app-initialized event', async () => {
        await page.waitForFunction(() => {
          return (window as any).appInit === true;
        });
      });

      await test.step('Wait for the full application render event', async () => {
        await page.waitForFunction(() => {
          return (window as any).appRendered === true;
        });
      });
    });
  });
  test.describe('SSR blocking render mode', () => {
    test('Successful SSR render - the react:render and app:rendered hooks are called', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      const events = await page.evaluate(
        () => (window as any).contextExternal.getState().ssrHooksStore.events
      );

      await test.step('The react:render hook is called', async () => {
        test.expect(events).toContain('react:render');
      });

      await test.step('The app:rendered hook is called', async () => {
        test.expect(events).toContain('app:rendered');
      });

      await test.step('The app:render-failed hook is not called', async () => {
        test.expect(events).not.toContain('app:render-failed');
      });

      await test.step('The react:error hooks are not called', async () => {
        test.expect(events.filter((e: string) => e.startsWith('react:error'))).toHaveLength(0);
      });
    });

    test('SSR fatal error (onShellError) - the server returns 500, the react:error and app:render-failed hooks are called', async ({
      page,
      app,
    }) => {
      const response = await page.request.fetch(`${app.serverUrl}/ssr-error/`);
      test.expect(response.status()).toBe(500);

      const hooksHeader = response.headers()['x-ssr-hooks'] ?? '';
      const events = hooksHeader.split(',').filter(Boolean);

      await test.step('The react:error:ssr:on-shell-error hook is called', async () => {
        test.expect(events).toContain('react:error:ssr:on-shell-error');
      });

      await test.step('The app:render-failed hook is called', async () => {
        test.expect(events).toContain('app:render-failed');
      });

      await test.step('The app:rendered hook is not called', async () => {
        test.expect(events).not.toContain('app:rendered');
      });
    });

    test('SSR recoverable error (onError inside Suspense) - the react:error and app:rendered hooks are called', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/ssr-recoverable-error/`);

      const events = await page.evaluate(
        () => (window as any).contextExternal.getState().ssrHooksStore.events
      );

      await test.step('The react:error:ssr:on-error hook is called for a recoverable error', async () => {
        test.expect(events).toContain('react:error:ssr:on-error');
      });

      await test.step('The react:render hook is called - the shell rendered successfully', async () => {
        test.expect(events).toContain('react:render');
      });

      await test.step('The app:rendered hook is called - a recoverable error does not block the render', async () => {
        test.expect(events).toContain('app:rendered');
      });

      await test.step('The app:render-failed hook is not called - an error inside Suspense is not fatal', async () => {
        test.expect(events).not.toContain('app:render-failed');
      });

      await test.step('The fallback rendered instead of the component with the error', async () => {
        const shellText = await page.textContent('#ssr-recoverable-ok');
        test.expect(shellText).toBe('Page shell rendered');
      });
    });
  });
});
