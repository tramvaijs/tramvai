import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('form component', () => {
  test.describe('no JS', () => {
    test('GET form submission appends query params to URL', async ({ app, browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      try {
        await page.goto(app.serverUrl);
        const searchForm = page
          .locator('form')
          .filter({ has: page.locator('input[name="q"]') })
          .first();
        await searchForm.locator('input[name="q"]').fill('searchterm');
        await Promise.all([
          page.waitForNavigation(),
          searchForm.locator('input[type="submit"]').click(),
        ]);
        expect(page.url()).toContain('q=searchterm');
      } finally {
        await context.close();
      }
    });

    test('POST + json renders form action result on page', async ({ app, browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      try {
        await page.goto(app.serverUrl);
        const mainForm = page
          .locator('form')
          .filter({ has: page.locator('input[name="username"]') });
        await mainForm.locator('input[name="username"]').fill('NoJSBrowserUser');
        await mainForm.locator('input[value="json"]').check();
        await Promise.all([
          page.waitForNavigation(),
          mainForm.locator('input[type="submit"]').click(),
        ]);
        const content = await page.content();
        expect(content).toContain('Hello, world!');
        expect(content).toContain('NoJSBrowserUser');
      } finally {
        await context.close();
      }
    });

    test('POST + redirect navigates to success page', async ({ app, browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      try {
        await page.goto(app.serverUrl);
        const mainForm = page
          .locator('form')
          .filter({ has: page.locator('input[name="responseType"]') });
        await mainForm.locator('input[value="redirect"]').check();
        await Promise.all([
          page.waitForNavigation(),
          mainForm.locator('input[type="submit"]').click(),
        ]);
        expect(page.url()).toContain('/success');
      } finally {
        await context.close();
      }
    });

    test('valid data shows result on page after submission', async ({ app, browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      try {
        await page.goto(`${app.serverUrl}/schema-validation/`);
        await page.fill('input[name="name"]', 'Alice');
        await page.fill('input[name="email"]', 'alice@example.com');
        await page.fill('input[name="age"]', '25');
        await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
        const content = await page.content();
        expect(content).toContain('Alice');
        expect(content).toContain('alice@example.com');
      } finally {
        await context.close();
      }
    });

    test('invalid data shows error on page after submission', async ({ app, browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      try {
        await page.goto(`${app.serverUrl}/schema-validation/`);
        await page.fill('input[name="name"]', 'X');
        await page.fill('input[name="email"]', 'not-an-email');
        await page.fill('input[name="age"]', '10');
        await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
        const content = await page.content();
        expect(content).toContain('"error"');
      } finally {
        await context.close();
      }
    });
  });

  test.describe('has JS', () => {
    test.skip('POST form sends fetch with Accept: application/json', async ({
      app,
      browser,
    }) => {});

    test.skip('POST form result is rendered on page without full reload', async ({
      app,
      browser,
    }) => {});

    test.skip('POST form performs SPA navigation when redirect is returned from form action', async ({
      app,
      browser,
    }) => {});

    test.skip('GET form appends query params to URL', async ({ app, browser }) => {});

    test.skip('form sends in name in hidden input', async ({ app, browser }) => {});

    test.skip('form with custom action sends request to that URL', async ({ app, browser }) => {});

    test.skip('form calls afterResponse', async ({ app, browser }) => {});

    test.skip('form with beforeSubmit and preventDefault call cancels the request', async ({
      app,
      browser,
    }) => {});

    test.skip('form with beforeSubmit can modify formData before submission', async ({
      app,
      browser,
    }) => {});

    test.skip('form with encType multipart/form-data sends file upload correctly', async ({
      app,
      browser,
    }) => {});
  });
});
