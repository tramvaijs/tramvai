import type { StartCliResult } from '@tramvai/test-integration';
import { sleep, startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';
import path from 'path';

jest.setTimeout(30000);

describe('render-to-stream. actions run mode - before', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli({
      name: 'render-to-stream',
      root: path.resolve(__dirname, '../', 'src'),
      type: 'application',
      modern: true,
      fileSystemPages: {
        enabled: true,
        pagesDir: false,
      },
      splitChunks: {
        mode: 'granularChunks',
      },
      sourceMap: false,
      postcss: {
        config: path.resolve(__dirname, '../', 'src/postcss'),
        cssLocalIdentName: '[name]__[local]_[hash:base64:5]',
      },
      hotRefresh: {
        enabled: false,
      },
      define: {
        development: {
          'process.env.SPA_ACTIONS_RUN_MODE': '"before"',
        },
      },
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  describe('client hydration', () => {
    it('deferred page', async () => {
      const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);

      const { page } = await getPageWrapper(`${app.serverUrl}/deferred/`);

      expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
        .toMatchInlineSnapshot(`
        "Tramvai 🥳
        Main
        Second
        Deferred
        Non-deferred
        Deferred Foo
        Deferred Bar
        Deferred Baz
        Deferred Page
        Response: ok
        Response: ok
        Error: Failed Fast Deferred
        Error: Failed Deferred
        this Footer in render-to-stream"
      `);

      await browser.close();
    });

    it('deferred page with parameter', async () => {
      const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);

      const { page } = await getPageWrapper(`${app.serverUrl}/deferred/foo/`);

      expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
        .toMatchInlineSnapshot(`
        "Tramvai 🥳
        Main
        Second
        Deferred
        Non-deferred
        Deferred Foo
        Deferred Bar
        Deferred Baz
        Deferred Id Page
        Response: foo
        this Footer in render-to-stream"
      `);

      await browser.close();
    });

    it('SPA-transition between same deferred page with different parameters', async () => {
      const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);

      const { page, router } = await getPageWrapper(`${app.serverUrl}/deferred/foo/`);

      await router.navigate('/deferred/bar/');

      expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
        .toMatchInlineSnapshot(`
        "Tramvai 🥳
        Main
        Second
        Deferred
        Non-deferred
        Deferred Foo
        Deferred Bar
        Deferred Baz
        Deferred Id Page
        Loading long...
        this Footer in render-to-stream"
      `);

      await sleep(1000);

      expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
        .toMatchInlineSnapshot(`
        "Tramvai 🥳
        Main
        Second
        Deferred
        Non-deferred
        Deferred Foo
        Deferred Bar
        Deferred Baz
        Deferred Id Page
        Response: bar
        this Footer in render-to-stream"
      `);

      await browser.close();
    });
  });
});
