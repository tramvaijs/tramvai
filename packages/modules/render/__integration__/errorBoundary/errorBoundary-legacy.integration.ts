import { legacySsrTest } from './test-fixture';

legacySsrTest.describe('errorBoundary legacy', () => {
  legacySsrTest.describe('Error page render, show legacy boundary fallback', () => {
    legacySsrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/legacy-error-boundary/`);

      await pageContent.toHaveTitle('Legacy Error Boundary');
    });
  });

  legacySsrTest('SPA-navigations', async ({ I, pageContent, app }) => {
    await I.gotoPage(`${app.serverUrl}/`);

    // success-page
    await pageContent.toHaveTitle('Page Component');

    // to legacy-error-boundary
    await pageContent.navigate(`/legacy-error-boundary/`);
    await pageContent.toHaveTitle('Legacy Error Boundary');

    // to success-page
    await pageContent.navigate(`/`);
    await pageContent.toHaveTitle('Page Component');
  });

  legacySsrTest(
    'Root client component error boundary call ERROR_BOUNDARY_TOKEN callbacks on catch',
    async ({ I, app, page, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/csr-extend-render-error/`);

      await pageContent.toHaveTitle('Legacy Error Boundary');

      await page.waitForFunction('Boolean(window.__errorBoundaryError)', { timeout: 5000 });
    }
  );

  legacySsrTest(
    'Page client component error boundary call ERROR_BOUNDARY_TOKEN callbacks on catch',
    async ({ I, app, page, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/error-on-client-in-layout/`);

      await pageContent.toHaveTitle('Legacy Error Boundary');

      await page.waitForFunction('Boolean(window.__errorBoundaryError)', { timeout: 5000 });
    }
  );
});
