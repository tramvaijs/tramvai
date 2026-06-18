import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('lazy modules', () => {
  test.describe('main page (no lazy modules)', () => {
    test('renders without lazy modules', async ({ app, I, page }) => {
      await I.gotoPage(app.serverUrl);
      await expect(page.locator('#main-title')).toHaveText('Store');
    });

    test('SSR returns 200', async ({ app }) => {
      await app.request('/').expect(200);
    });
  });

  test.describe('page component modules (FS routing)', () => {
    test('renders checkout page with PaymentModule services', async ({ app, I, page }) => {
      await I.gotoPage(`${app.serverUrl}/checkout/`);

      await expect(page.locator('#checkout-title')).toHaveText('Checkout');
      await expect(page.locator('#payment-methods')).toContainText('card');
      await expect(page.locator('#payment-methods')).toContainText('sbp');
      await expect(page.locator('#payment-methods')).toContainText('installments');
    });

    test('multiple modules on one page — both register and provide services', async ({
      app,
      I,
      page,
    }) => {
      await I.gotoPage(`${app.serverUrl}/checkout/`);

      // PaymentModule
      await expect(page.locator('#order-summary')).toContainText('1020');
      // AnalyticsModule — singleton accumulates, just verify it rendered
      await expect(page.locator('#checkout-analytics')).toContainText('Tracked:');
    });

    test('SSR renders checkout page with data from both modules', async ({ app }) => {
      await app
        .request('/checkout/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('Checkout');
          expect(res.text).toContain('card');
          expect(res.text).toContain('1020');
          expect(res.text).toContain('checkout-analytics');
        });
    });

    test('SPA navigation to checkout page loads modules dynamically', async ({
      app,
      I,
      page,
      tramvai,
    }) => {
      await I.gotoPage(app.serverUrl);
      await expect(page.locator('#main-title')).toHaveText('Store');

      await tramvai.spaNavigate('/checkout/');

      await expect(page.locator('#checkout-title')).toHaveText('Checkout');
      await expect(page.locator('#payment-methods')).toContainText('card');
      await expect(page.locator('#checkout-analytics')).toContainText('Tracked:');
    });
  });

  test.describe('bundle modules (classic bundles)', () => {
    test('renders catalog page with services from bundle and page modules', async ({
      app,
      I,
      page,
    }) => {
      await I.gotoPage(`${app.serverUrl}/old/`);

      await expect(page.locator('#catalog-title')).toHaveText('Product Catalog (bundle)');
      // AnalyticsModule from bundle
      await expect(page.locator('#analytics-info')).toContainText('Tracked events:');
      // PaymentModule from page component modules
      await expect(page.locator('#catalog-payment-methods')).toContainText('card');
    });

    test('SSR renders catalog page with data from both module sources', async ({ app }) => {
      await app
        .request('/old/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('Product Catalog (bundle)');
          expect(res.text).toContain('analytics-info');
          expect(res.text).toContain('card');
        });
    });

    test('SPA navigation to catalog page loads bundle modules', async ({
      app,
      I,
      page,
      tramvai,
    }) => {
      await I.gotoPage(app.serverUrl);
      await expect(page.locator('#main-title')).toHaveText('Store');

      await tramvai.spaNavigate('/old/');

      await expect(page.locator('#catalog-title')).toHaveText('Product Catalog (bundle)');
      await expect(page.locator('#analytics-info')).toContainText('Tracked events:');
    });
  });

  test.describe('imperative loading (LAZY_MODULES_REGISTRY_TOKEN)', () => {
    test('module loaded via registry — providers available on page', async ({ app, I, page }) => {
      await I.gotoPage(`${app.serverUrl}/imperative/`);

      await expect(page.locator('#imperative-title')).toHaveText('Currency Converter');
      await expect(page.locator('#rates')).toContainText('USD: 0.011');
      await expect(page.locator('#rates')).toContainText('EUR: 0.01');
      await expect(page.locator('#converted')).toContainText('11');
    });

    test('SSR renders page with imperatively loaded module', async ({ app }) => {
      await app
        .request('/imperative/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('Currency Converter');
          expect(res.text).toContain('0.011');
        });
    });

    test('SPA navigation loads module via registry guard', async ({ app, I, page, tramvai }) => {
      await I.gotoPage(app.serverUrl);
      await expect(page.locator('#main-title')).toHaveText('Store');

      await tramvai.spaNavigate('/imperative/');

      await expect(page.locator('#imperative-title')).toHaveText('Currency Converter');
      await expect(page.locator('#rates')).toContainText('USD: 0.011');
    });
  });

  test.describe('singleton scope across requests (ROOT_DI_TOKEN)', () => {
    test('singleton provider from lazy module is shared between SSR requests', async ({ app }) => {
      // AnalyticsModule provides ANALYTICS_SERVICE_TOKEN as Scope.SINGLETON with
      // a mutable events array. Each SSR request to /checkout/ calls analytics.track().
      // The singleton persists — second request sees more events than the first.
      const res1 = await app.request('/checkout/').expect(200);
      const count1 = parseInt(
        res1.text.match(/Tracked:\s*(?:<!--[^>]*-->)?\s*(\d+)/)?.[1] ?? '0',
        10
      );

      const res2 = await app.request('/checkout/').expect(200);
      const count2 = parseInt(
        res2.text.match(/Tracked:\s*(?:<!--[^>]*-->)?\s*(\d+)/)?.[1] ?? '0',
        10
      );

      expect(count2).toBeGreaterThan(count1);
    });
  });

  test.describe('multi-token timing', () => {
    test('reducer added to COMBINE_REDUCERS from lazy module does not appear in store', async ({
      app,
      I,
      page,
      tramvai,
    }) => {
      // EdgeCaseModule adds LazyStore to COMBINE_REDUCERS, but COMBINE_REDUCERS is
      // a SINGLETON multi-token already resolved during app init.
      // The new value should NOT be picked up by the dispatcher.
      await I.gotoPage(`${app.serverUrl}/edge-cases/`);

      const state = await tramvai.getState('lazyStore');
      expect(state).toBeUndefined();
    });
  });

  test.describe('CommandLineRunner timing', () => {
    test('command added to init stage from lazy module is NOT executed', async ({
      app,
      I,
      page,
    }) => {
      // EdgeCaseModule adds a command to commandLineListTokens.init,
      // but init stage has already been executed during app bootstrap.
      // The command should NOT run.
      await I.gotoPage(`${app.serverUrl}/edge-cases/`);

      await expect(page.locator('#init-command-status')).toContainText(
        'Init command executed: false'
      );
    });

    test('SSR confirms init command was not executed', async ({ app }) => {
      await app
        .request('/edge-cases/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('init-command-status');
          expect(res.text).toMatch(/Init command executed:[\s\S]*false/);
        });
    });
  });

  test.describe('deduplication', () => {
    test('navigate away and back — modules stay in container, page still works', async ({
      app,
      I,
      page,
      tramvai,
    }) => {
      await I.gotoPage(`${app.serverUrl}/checkout/`);
      await expect(page.locator('#checkout-title')).toHaveText('Checkout');

      await tramvai.spaNavigate('/');
      await expect(page.locator('#main-title')).toHaveText('Store');

      await tramvai.spaNavigate('/checkout/');
      await expect(page.locator('#checkout-title')).toHaveText('Checkout');
      await expect(page.locator('#payment-methods')).toContainText('card');
    });

    test('same module in different routes — registered once, works on both', async ({
      app,
      I,
      page,
      tramvai,
    }) => {
      // AnalyticsModule is used in both checkout (Page.modules) and catalog (Bundle.modules)
      await I.gotoPage(`${app.serverUrl}/checkout/`);
      await expect(page.locator('#checkout-analytics')).toContainText('Tracked:');

      await tramvai.spaNavigate('/old/');
      await expect(page.locator('#analytics-info')).toContainText('Tracked events:');
    });
  });

  test.describe('SSR and hydration', () => {
    test('no hydration errors on checkout page', async ({ app, I, page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await I.gotoPage(`${app.serverUrl}/checkout/`);
      await page.waitForLoadState('networkidle');

      const hydrationErrors = errors.filter(
        (e) => e.includes('hydrat') || e.includes('mismatch') || e.includes('did not match')
      );
      expect(hydrationErrors).toHaveLength(0);
    });

    test('no hydration errors on catalog page', async ({ app, I, page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await I.gotoPage(`${app.serverUrl}/old/`);
      await page.waitForLoadState('networkidle');

      const hydrationErrors = errors.filter(
        (e) => e.includes('hydrat') || e.includes('mismatch') || e.includes('did not match')
      );
      expect(hydrationErrors).toHaveLength(0);
    });
  });
});
