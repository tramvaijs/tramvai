import { test } from './test-fixture';

test.describe('examples/pwa/application-monitoring-transports', () => {
  test('the default dispatcher is installed without any INLINE_REPORTER_FACTORY_SCRIPT_TOKEN override', async ({
    page,
    app,
    I,
  }) => {
    await I.gotoPage(`${app.serverUrl}/simple/`);

    const hasDispatcher = await page.evaluate(() => {
      const reporter = (window as any).__TRAMVAI_INLINE_REPORTER;
      return (
        typeof reporter?.send === 'function' &&
        typeof reporter?.registerTransport === 'function' &&
        typeof reporter?.registerExtension === 'function'
      );
    });

    test.expect(hasDispatcher).toBe(true);
  });

  test('two independently-registered transports both receive html-opened, without knowing about each other', async ({
    page,
    app,
    I,
  }) => {
    await I.gotoPage(`${app.serverUrl}/simple/`);

    await page.waitForFunction(() => (window as any).__transportACalls?.length > 0);
    await page.waitForFunction(() => (window as any).__transportBCalls?.length > 0);

    const [callsA, callsB] = await page.evaluate(() => [
      (window as any).__transportACalls,
      (window as any).__transportBCalls,
    ]);

    test.expect(callsA.some((c: any) => c.eventName === 'html-opened')).toBe(true);
    test.expect(callsB.some((c: any) => c.eventName === 'html-opened')).toBe(true);
  });

  test('an extension enriches only the event it targets, leaving other events unchanged', async ({
    page,
    app,
    I,
  }) => {
    await I.gotoPage(`${app.serverUrl}/simple/`);

    await page.waitForFunction(() => (window as any).__transportACalls?.length > 0);

    await page.evaluate(() => {
      const error = new Error('unhandled error example');
      window.dispatchEvent(new ErrorEvent('error', { error }));
    });

    await page.waitForFunction(() =>
      (window as any).__transportACalls?.some((c: any) => c.eventName === 'unhandled-error')
    );

    const calls = await page.evaluate(() => (window as any).__transportACalls);

    const htmlOpened = calls.find((c: any) => c.eventName === 'html-opened');
    const unhandledError = calls.find((c: any) => c.eventName === 'unhandled-error');

    test.expect(htmlOpened.payload.regionId).toBe('region-test-123');
    test.expect(unhandledError.payload.regionId).toBeUndefined();
  });

  test('script order: dispatcher bootstrap, then extensions/transports, then retryAssets', async ({
    page,
    app,
    I,
  }) => {
    await I.gotoPage(`${app.serverUrl}/simple/`);

    const scriptsContent = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script'))
        .map((s) => s.textContent)
        .filter(Boolean);
    });

    const bootstrapIndex = scriptsContent.findIndex((text) =>
      text!.includes('window.__TRAMVAI_INLINE_REPORTER = (function inlineReporter')
    );
    const extensionIndex = scriptsContent.findIndex((text) =>
      text!.includes('window.__TRAMVAI_INLINE_REPORTER.registerExtension?.(')
    );
    const transportIndex = scriptsContent.findIndex((text) =>
      text!.includes('window.__TRAMVAI_INLINE_REPORTER.registerTransport?.(')
    );
    const retryScriptIndex = scriptsContent.findIndex((text) =>
      text!.includes('(function retryAssets(')
    );

    test.expect(bootstrapIndex).toBeGreaterThan(-1);
    test.expect(extensionIndex).toBeGreaterThan(-1);
    test.expect(transportIndex).toBeGreaterThan(-1);
    test.expect(retryScriptIndex).toBeGreaterThan(-1);

    test.expect(bootstrapIndex).toBeLessThan(extensionIndex);
    test.expect(extensionIndex).toBeLessThan(transportIndex);
    test.expect(transportIndex).toBeLessThan(retryScriptIndex);
  });
});
