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

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    this.chunks.push(chunk.toString('utf-8'));
    callback();
  }
}

const RESOLVE_MARKER = `__TRAMVAI_DEFERRED_ACTIONS['host__longDeferredSyncState'].resolve`;
const LONG_NORMAL_TEXT = 'long normal action result';
const LONG_DEFERRED_TEXT = 'long deferred action result';
const MULTI_DEFERRED_TEXT = 'multi deferred action result 3';

describe('render-to-stream. deferred state sync', () => {
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
    it('streams the store event and not within the initial chunk', (done) => {
      const stream = new WritableBuffer();

      setTimeout(() => {
        const initialHTML = stream.getChunks().join('\n');

        expect(initialHTML).toContain('window.__TRAMVAI_STREAMED_EVENTS =');

        expect(initialHTML).not.toContain(LONG_DEFERRED_TEXT);
      }, 700);

      app
        .request('/deferred-state-sync/?streamingTimeout=5000')
        .expect(200)
        .expect('Transfer-Encoding', 'chunked')
        .pipe(stream)
        .on('finish', (error?: Error) => {
          if (error) {
            return done(error);
          }

          const finalHTML = stream.getChunks().join('\n');

          expect(finalHTML).toContain(RESOLVE_MARKER);
          expect(finalHTML).toContain(LONG_DEFERRED_TEXT);
          expect(finalHTML).toContain(MULTI_DEFERRED_TEXT);

          done();
        });
    });

    // eslint-disable-next-line jest/no-done-callback
    it('does not stream store updates from a long-running non-deferred action', (done) => {
      const stream = new WritableBuffer();

      app
        .request('/deferred-state-sync/?streamingTimeout=5000')
        .expect(200)
        .pipe(stream)
        .on('finish', (error?: Error) => {
          if (error) {
            return done(error);
          }

          const finalHTML = stream.getChunks().join('\n');

          expect(finalHTML).not.toContain(LONG_NORMAL_TEXT);

          done();
        });
    });
  });

  describe('client hydration', () => {
    it('syncs deferred-dispatched state to both patterns without hydration mismatch', async () => {
      const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);
      const { page } = await getPageWrapper();

      const hydrationErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && /hydrat/i.test(msg.text())) {
          hydrationErrors.push(msg.text());
        }
      });

      await page.goto(`${app.serverUrl}/deferred-state-sync/?streamingTimeout=5000`);

      await page.waitForFunction(
        (text) => {
          const noSuspense = document.querySelector('[data-testid="multiDeferred"]');
          const withSuspense = document.querySelector('[data-testid="with-suspense"]');
          return (
            !!noSuspense?.textContent?.includes(text) && !!withSuspense?.textContent?.includes(text)
          );
        },
        MULTI_DEFERRED_TEXT,
        { timeout: 5000 }
      );

      const noSuspenseText = await page.$eval(
        '[data-testid="multiDeferred"]',
        (node) => (node as HTMLElement).innerText
      );
      const withSuspenseText = await page.$eval(
        '[data-testid="with-suspense"]',
        (node) => (node as HTMLElement).innerText
      );

      expect(noSuspenseText).toContain(`Response: ${MULTI_DEFERRED_TEXT}`);
      expect(withSuspenseText).toContain(`Response: ${MULTI_DEFERRED_TEXT}`);

      expect(hydrationErrors).toEqual([]);

      await browser.close();
    });
  });
});
