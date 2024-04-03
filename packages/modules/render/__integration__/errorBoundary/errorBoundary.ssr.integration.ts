import { expect } from '@playwright/test';
import { ssrTest } from './test-fixture';
import { SSRDocumentContentMocks } from './mocks/ssrDocumentContent';

function getSnapshotName(test: typeof ssrTest) {
  return [`something`];
}

ssrTest.describe('errorBoundary SSR', () => {
  ssrTest.describe('Success page render', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/');

      expect(statusCode).toBe(200);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Page Component');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      await pageContent.toHaveTitle('Page Component');
    });
  });

  ssrTest.describe('Error page render, show default boundary', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-default-fallback/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-default-fallback/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Default Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-default-fallback/`);

      await pageContent.toHaveTitle('Default Error Boundary');
    });
  });

  ssrTest.describe('Error page render, show specific page boundary', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-specific-fallback/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-specific-fallback/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Page Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-specific-fallback/`);

      await pageContent.toHaveTitle('Page Error Boundary');
    });
  });

  ssrTest.describe('EXTEND_RENDER error, root layout rendered', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/extend-render-error/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { render } = app;

      const { parsed } = await render('/extend-render-error/');
      const documentContent = parsed.outerHTML.replace(
        /"error--module__title.+"/,
        '"error--module__title"'
      );

      expect(documentContent).toBe(SSRDocumentContentMocks.extendRender.render);
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/extend-render-error/`);

      expect(await pageContent.getOuterHtmlOfDocument()).toBe(
        SSRDocumentContentMocks.extendRender.hydrate
      );
    });
  });

  ssrTest.describe('Error page render, show specific page boundary from file-system pages', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-fs-specific-fallback/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-fs-specific-fallback/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('FS Pages Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-fs-specific-fallback/`);

      await pageContent.toHaveTitle('FS Pages Error Boundary');
    });
  });

  ssrTest.describe('Error page render, show default boundary fallback from token', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/token-default-error-boundary/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/token-default-error-boundary/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Token Default Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/token-default-error-boundary/`);

      await pageContent.toHaveTitle('Token Default Error Boundary');
    });
  });

  ssrTest.describe('Not existed page render, show default boundary', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-not-existed/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-not-existed/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Default Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-not-existed/`);

      await pageContent.toHaveTitle('Default Error Boundary');
    });
  });

  ssrTest.describe('Action dispatch setPageErrorEvent, show default boundary', () => {
    ssrTest('Custom HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-action-error/');

      expect(statusCode).toBe(410);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-action-error/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Default Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-action-error/`);

      await pageContent.toHaveTitle('Default Error Boundary');
    });
  });

  ssrTest.describe('Guard dispatch setPageErrorEvent, show default boundary', () => {
    ssrTest('Custom HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-guard-error/');

      expect(statusCode).toBe(503);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-guard-error/');
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(pageContent).toBe('Default Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-guard-error/`);

      await pageContent.toHaveTitle('Default Error Boundary');
    });
  });

  ssrTest.describe('Global error, render root boundary', () => {
    ssrTest('Custom HTTP status and headers', async ({ app }) => {
      const { statusCode, headers } = await app.request('/global-error/');

      expect(statusCode).toBe(503);
      expect(headers).toMatchObject({
        'cache-control': 'no-store, no-cache, must-revalidate',
        'content-type': 'text/html; charset=utf-8',
      });
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/global-error/');
      const documentContent = parsed.outerHTML.replace(
        /"error--module__title.+"/,
        '"error--module__title"'
      );

      expect(documentContent).toBe(SSRDocumentContentMocks.globalError.render);
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/global-error/`);

      expect(await pageContent.getOuterHtmlOfDocument()).toBe(
        SSRDocumentContentMocks.globalError.hydrate
      );
    });
  });

  ssrTest.describe('Nested layout rendered when exception in page component', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-nested-layout/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-nested-layout/');
      const layoutContent = parsed.querySelector('nav').innerText;
      const pageContent = parsed.querySelector('main h1').innerText;

      expect(layoutContent).toBe('Nested Layout');
      expect(pageContent).toBe('Page Error Boundary');
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-nested-layout/`);

      await pageContent.toHaveLayoutText('Nested Layout');
      await pageContent.toHaveTitle('Page Error Boundary');
    });
  });

  ssrTest.describe('Nested layout error, root layout rendered', () => {
    ssrTest('HTTP status', async ({ app }) => {
      const { statusCode } = await app.request('/page-error-nested-layout-error/');

      expect(statusCode).toBe(500);
    });

    ssrTest('SSR render', async ({ app }) => {
      const { parsed } = await app.render('/page-error-nested-layout-error/');
      const documentContent = parsed.outerHTML.replace(
        /"error--module__title.+"/,
        '"error--module__title"'
      );

      expect(documentContent).toBe(SSRDocumentContentMocks.nestedLayout.render);
    });

    ssrTest('SSR hydrate', async ({ I, app, pageContent }) => {
      await I.gotoPage(`${app.serverUrl}/page-error-nested-layout-error/`);

      expect(await pageContent.getOuterHtmlOfDocument()).toBe(
        SSRDocumentContentMocks.nestedLayout.hydrate
      );
    });
  });

  ssrTest('SPA-navigations', async ({ I, app, pageContent }) => {
    await I.gotoPage(`${app.serverUrl}/`);
    let pageContentTitle: string | undefined;

    // success-page
    await pageContent.toHaveTitle('Page Component');

    // to page-error-default-fallback
    await pageContent.navigate('/page-error-default-fallback/');
    await pageContent.toHaveTitle('Default Error Boundary');

    // to page-error-specific-fallback
    await pageContent.navigate('/page-error-specific-fallback/');
    await pageContent.toHaveTitle('Page Error Boundary');

    // to page-error-fs-specific-fallback
    await pageContent.navigate('/page-error-fs-specific-fallback/');
    await pageContent.toHaveTitle('FS Pages Error Boundary');

    // to page-error-not-existed
    await pageContent.navigate('/page-error-not-existed/');
    await pageContent.toHaveTitle('Default Error Boundary');

    // to token-default-error-boundary
    await pageContent.navigate('/token-default-error-boundary/');
    await pageContent.toHaveTitle('Token Default Error Boundary');

    // to page-action-error
    await pageContent.navigate('/page-action-error/');
    await pageContent.toHaveTitle('Default Error Boundary');

    // to page-guard-error
    await pageContent.navigate('/page-guard-error/');
    await pageContent.toHaveTitle('Default Error Boundary');

    // to success-page
    await pageContent.navigate('/');
    await pageContent.toHaveTitle('Page Component');
  });
});
