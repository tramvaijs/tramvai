import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';
import path from 'path';

jest.setTimeout(30000);

describe('react-18-integration', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli('react-18-integration', {
      rootDir: path.resolve(__dirname, '../'),
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  it('main page render full content after hydration', async () => {
    const { browser } = await initPlaywright(app.serverUrl);

    const page = await browser.newPage();

    await page.goto(`${app.serverUrl}/`);
    await page
      .locator('p')
      .filter({ hasText: /^Async component$/ })
      .waitFor();

    expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
      .toMatchInlineSnapshot(`
      "Tramvai 🥳

      Main Page with React 18

      Hooks
      Batching state updates
      UpdateUpdate sync

      Renders: 0

      Suspense

      I am waiting for async component loaded too

      Async component

      this Footer in react-18-integration"
    `);

    await browser.close();
  });
});
