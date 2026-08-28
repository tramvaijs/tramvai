import { Writable } from 'stream';
import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { getStaticUrl } from '@tramvai/test-integration';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { PromiseType } from 'utility-types';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { testCasesConditions } from './test-cases';

jest.setTimeout(4 * 60 * 1000);

class WritableBuffer extends Writable {
  private chunks: string[] = [];

  getText() {
    return this.chunks.join('');
  }

  _write(chunk: Buffer, _encoding: string, callback: () => void) {
    this.chunks.push(chunk.toString('utf-8'));
    callback();
  }
}

const testCase =
  testCasesConditions[
    `${process.env.ROOT_APP_VERSION ?? 'latest'}-${process.env.CHILD_APP_VERSION ?? 'latest'}`
  ];

if (!testCase) {
  throw Error(
    `Unsupported versions combination for cross version test suite: { rootAppVersion: ${process.env.ROOT_APP_VERSION}, childAppsVersion: ${process.env.CHILD_APP_VERSION} }`
  );
}

const { rootAppVersion, childAppsVersion } = testCase;

if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
  describe(`Child App deferred actions with streaming`, () => {
    let childApp: PromiseType<ReturnType<typeof start>>;
    let rootApp: PromiseType<ReturnType<typeof startCli>>;

    beforeAll(async () => {
      const { startChildApp } = await import(`./cross-version-tests/latest/cli`);

      childApp = await startChildApp('deferred');
    });

    const mockerApp = fastify({
      logger: {
        level: 'warn',
      },
    });

    const mockerPort = getPort();

    beforeAll(async () => {
      await mockerApp.register(fastifyReplyFrom);

      await mockerApp.addHook('onRequest', async (req, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
      });

      await mockerApp.get('/*', async (request, reply) => {
        const [_, childAppName, filename] = request.url.split('/');

        if (childAppName === 'deferred') {
          return reply.from(`${getStaticUrl(childApp)}/deferred/${filename}`);
        }
      });

      await mockerApp.listen({ port: mockerPort });
    });

    beforeAll(async () => {
      const { startRootApp } = await import(`./cross-version-tests/latest/cli`);

      rootApp = await startRootApp({
        define: {},
        env: {
          CHILD_APP_EXTERNAL_URL: `http://localhost:${mockerPort}/`,
          HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED: 'true',
          REACT_SERVER_RENDER_MODE: 'streaming',
        },
      });
    });

    afterAll(async () => {
      await Promise.all([mockerApp.close(), childApp?.close(), rootApp.close()]);
    });

    const SHORT_TIMEOUT_URL = '/deferred/?streamingTimeout=200';

    describe('streaming', () => {
      // eslint-disable-next-line jest/no-done-callback
      it('streams the promise-creation script for a child-app deferred action', (done) => {
        const stream = new WritableBuffer();

        rootApp
          .request('/deferred/')
          .expect(200)
          .pipe(stream)
          .on('finish', (error: unknown) => {
            if (error) {
              return done(error);
            }

            const html = stream.getText();

            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['host__deferredHostAction'] = new __Deferred();`
            );
            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['host__deferredHostAction'].resolve(`
            );

            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['deferred@0.0.0-stub__deferredChildAction'].resolve(`
            );

            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['deferred@0.0.0-stub__deferredChildAction'] = new __Deferred();`
            );

            done();
          });
      });

      const { getPageWrapper } = testAppInBrowser(() => rootApp);

      it('re-runs the child deferred action on SPA navigation between two routes of the same bundle', async () => {
        const { serverUrl } = rootApp;
        const { page, router } = await getPageWrapper();

        const childSpan = '[data-testid="child-with-suspense"] span';

        await page.goto(`${serverUrl}/deferred/`);
        await page.waitForFunction(
          (sel) => document.querySelector(sel)?.textContent?.includes('"env":"server"'),
          childSpan
        );

        const initial = await page.locator(childSpan).textContent();
        expect(initial).toContain('"env":"server"');

        await router.navigate('/deferred-2/');

        await page.waitForTimeout(2500);

        const after = await page.locator(childSpan).textContent();
        expect(after).toContain('"env":"client"');
      });
    });

    describe('timeout and abort', () => {
      // eslint-disable-next-line jest/no-done-callback
      it('rejects child-app deferred action with AbortedDeferredError on timeout', (done) => {
        const stream = new WritableBuffer();

        rootApp
          .request(SHORT_TIMEOUT_URL)
          .pipe(stream)
          .on('finish', (error: unknown) => {
            if (error) {
              return done(error);
            }

            const html = stream.getText();

            expect(html).not.toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['deferred@0.0.0-stub__deferredChildAction'].resolve(`
            );

            const childReject = html.match(
              /window\.__TRAMVAI_DEFERRED_ACTIONS\['deferred@0.0.0-stub__deferredChildAction'\]\.reject\((.*?)\);/
            );

            expect(childReject).not.toBeNull();

            const rejectPayload = childReject![1];

            expect(rejectPayload).toContain('AbortedDeferredError');
            expect(rejectPayload).toContain('Deferred Action Abort');

            done();
          });
      });

      // eslint-disable-next-line jest/no-done-callback
      it('aborts both host and child-app deferred actions on timeout', (done) => {
        const stream = new WritableBuffer();

        rootApp
          .request(SHORT_TIMEOUT_URL)
          .pipe(stream)
          .on('finish', (error: unknown) => {
            if (error) {
              return done(error);
            }

            const html = stream.getText();

            expect(html).not.toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['host__deferredHostAction'].resolve(`
            );

            expect(html).not.toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['deferred@0.0.0-stub__deferredChildAction'].resolve(`
            );

            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['host__deferredHostAction'] = new __Deferred();`
            );
            expect(html).toContain(
              `window.__TRAMVAI_DEFERRED_ACTIONS['deferred@0.0.0-stub__deferredChildAction'] = new __Deferred();`
            );

            done();
          });
      });
    });
  });
} else {
  describe('child-app-deferred', () => {
    // eslint-disable-next-line jest/expect-expect
    it('skipped', () => {});
  });
}
