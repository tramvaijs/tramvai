import { expect } from '@playwright/test';
import { csrTest } from './test-fixture';

csrTest.describe('errorBoundary CSR', () => {
  csrTest('renders successfully as csr', async ({ I, app, pageContent }) => {
    const { body } = await app.render('/');
    expect(body).toContain('Loading...');

    await I.gotoPage(`${app.serverUrl}/`);
    await pageContent.toHaveTitle('Page Component');
  });

  csrTest(
    'renders with DEFAULT_ERROR_BOUNDARY_COMPONENT in case of error in EXTEND_ERROR',
    async ({ I, app, pageContent }) => {
      const { body } = await app.render('/csr-extend-render-error/');
      expect(body).toContain('Loading...');

      await I.gotoPage(`${app.serverUrl}/csr-extend-render-error/`);
      await pageContent.toHaveTitle('Token Default Error Boundary');
    }
  );

  csrTest(
    `renders with DEFAULT_ERROR_BOUNDARY_COMPONENT in case of error in useEffect component of EXTEND_ERROR`,
    async ({ I, app, pageContent }) => {
      const { body } = await app.render('/csr-extend-render-use-effect-error/');
      expect(body).toContain('Loading...');

      await I.gotoPage(`${app.serverUrl}/csr-extend-render-use-effect-error/`);
      await pageContent.toHaveTitle('Token Default Error Boundary');
    }
  );

  csrTest(
    `renders with DEFAULT_ERROR_BOUNDARY_COMPONENT in case of error in render layout on client`,
    async ({ I, app, pageContent }) => {
      const { body } = await app.render('/error-on-client-in-layout/');
      expect(body).toContain('Loading...');

      await I.gotoPage(`${app.serverUrl}/error-on-client-in-layout/`);
      await pageContent.toHaveTitle('Token Default Error Boundary');
    }
  );
});
