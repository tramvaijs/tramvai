import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';
import path from 'path';
import { Writable } from 'stream';

jest.setTimeout(30000);

class WritableBuffer extends Writable {
  private chunks: string[] = [];

  getChunks() {
    return this.chunks;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk.toString('utf-8'));
    callback();
  }
}

describe('render-to-stream', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli('render-to-stream', {
      rootDir: path.resolve(__dirname, '../'),
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  describe('streaming response', () => {
    // eslint-disable-next-line jest/no-done-callback
    it('deferred page', (done) => {
      const stream = new WritableBuffer();

      const initialChunksContent = [
        '<!DOCTYPE html>',
        // actions, resolved before response
        `window.__TRAMVAI_DEFERRED_ACTIONS['fastDeferred'].resolve({"data":"ok"});</script>`,
        `window.__TRAMVAI_DEFERRED_ACTIONS['failedFastDeferred'].reject({"executionContextName":"root.command-line:resolve_page_deps.pageActions.failedFastDeferred","message":"Failed Fast Deferred"`,
        '<div class="application">',
        // lazy component outside Suspense
        'Deferred Page',
        `<script>typeof window.__TRAMVAI_DEFERRED_HYDRATION === 'function' ? window.__TRAMVAI_DEFERRED_HYDRATION() : window.__TRAMVAI_DEFERRED_HYDRATION = true;</script>`,
      ];
      const deferredChunksContent = [
        // deferred actions promises teleportation
        `<script>window.__TRAMVAI_DEFERRED_ACTIONS['longDeferred'].resolve({"data":"ok"});</script>`,
        `<script>window.__TRAMVAI_DEFERRED_ACTIONS['failedDeferred'].reject({"executionContextName":"root.command-line:resolve_page_deps.pageActions.failedDeferred","message":"Failed Deferred"`,
        // lazy component inside Suspense, blocking assets
        'components-features-Data-Data.chunk.css',
        'components-features-Data-Data.chunk.js',
        `Response: ok`,
        '</body></html>',
      ];

      setTimeout(() => {
        const initialHTML = stream.getChunks().join('\n');

        // all critical scripts async for streaming
        expect(initialHTML.match(/data-critical="true" async="async"/g)?.length).toBe(5);

        initialChunksContent.forEach((chunk) => {
          expect(initialHTML).toContain(chunk);
        });

        deferredChunksContent.forEach((chunk) => {
          expect(initialHTML).not.toContain(chunk);
        });
      }, 500);

      app
        .request('/deferred/')
        .expect(200)
        .expect('Transfer-Encoding', 'chunked')
        .pipe(stream)
        .on('finish', (error) => {
          if (error) {
            return done(error);
          }

          const finalHTML = stream.getChunks().join('\n');

          deferredChunksContent.forEach((chunk) => {
            expect(finalHTML).toContain(chunk);
          });

          done();
        });
    });
  });

  describe('server-side rendering', () => {
    it('main page', async () => {
      const { parsed } = await app.render('/');

      expect(parsed.innerHTML).toMatchSnapshot();
    });

    it('deferred page', async () => {
      const { parsed } = await app.render('/deferred/');

      expect(parsed.innerHTML).toMatchSnapshot();
    });

    it('non-deferred page', async () => {
      const { parsed } = await app.render('/non-deferred/');

      expect(parsed.innerHTML).toMatchSnapshot();
    });
  });

  describe('client hydration', () => {
    it('main page', async () => {
      const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);

      const { page } = await getPageWrapper(app.serverUrl);

      expect(await page.$eval('.application', (node) => (node as HTMLElement).innerText))
        .toMatchInlineSnapshot(`
              "Tramvai 🥳
              Main
              Second
              Deferred
              Non-deferred
              Main Page
              Child Component
              Error boundary
              this Footer in render-to-stream

              This is modal for index page!"
          `);

      await browser.close();
    });

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
        Deferred Page
        Response: ok
        Response: ok
        Error: Failed Fast Deferred
        Error: Failed Deferred
        this Footer in render-to-stream"
      `);

      await browser.close();
    });
  });
});
