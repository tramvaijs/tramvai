import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getStaticUrl, sleep } from '@tramvai/test-integration';
import type { PromiseType } from 'utility-types';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { waitHydrated } from '@tramvai/test-pw';

jest.setTimeout(3 * 60 * 1000);

describe(`Child Apps with streaming`, () => {
  let childAppBase: PromiseType<ReturnType<typeof start>>;
  let childAppError: PromiseType<ReturnType<typeof start>>;
  let rootApp: PromiseType<ReturnType<typeof startCli>>;

  beforeAll(async () => {
    const { startChildApp } = await import(`./cross-version-tests/latest/cli`);

    [childAppBase, childAppError] = await Promise.all([
      startChildApp('base'),
      startChildApp('error'),
    ]);
  });

  const mockerApp = fastify({
    logger: true,
  });

  const mockerPort = getPort();
  const mockerHandlerMock = jest.fn();

  beforeAll(async () => {
    await mockerApp.register(fastifyReplyFrom);

    await mockerApp.addHook('onRequest', async (req, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
    });
    await mockerApp.addHook('preHandler', async (...args) => mockerHandlerMock(...args));

    await mockerApp.get('/*', async (request, reply) => {
      const [_, childAppName, filename] = request.url.split('/');

      switch (childAppName) {
        case 'base':
        case 'base-not-preloaded':
          return reply.from(
            `${getStaticUrl(childAppBase)}/base/${filename.replace(/base-not-preloaded/, 'base')}`
          );

        case 'error':
          return reply.from(`${getStaticUrl(childAppError)}/error/${filename}`);
      }
    });

    await mockerApp.listen({ port: mockerPort });
  });

  beforeAll(async () => {
    const { startRootApp } = await import(`./cross-version-tests/latest/cli`);

    rootApp = await startRootApp({
      define: {
        get 'process.env.CHILD_APP_BASE'() {
          return `"${getStaticUrl(childAppBase)}/"`;
        },
      },
      env: {
        CHILD_APP_EXTERNAL_URL: `http://localhost:${mockerPort}/`,
        HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED: 'true',
        REACT_SERVER_RENDER_MODE: 'streaming',
      },
    });
  });

  const { getPageWrapper } = testAppInBrowser(() => rootApp);

  afterAll(async () => {
    await Promise.all([
      mockerApp.close(),
      childAppBase.close(),
      childAppError?.close(),
      rootApp.close(),
    ]);
  });

  beforeEach(() => {
    mockerHandlerMock.mockReset();
  });

  describe('base', () => {
    it('client entry chunk should be loaded before hydration for preloaded', async () => {
      const { page } = await getPageWrapper();

      page.route('**/*', async (route) => {
        if (route.request().url().includes('/base/base_client@0.0.0-stub.js')) {
          // force client entry chunk to load after main application chunks
          await sleep(200);
        }
        return route.continue();
      });

      const clientEntryPromise = page.waitForResponse((response) =>
        response.url().includes('/base/base_client@0.0.0-stub.js')
      );
      const hydrationPromise = waitHydrated(page);

      const hydrationOrClientChunkRace = Promise.race([
        hydrationPromise.then(() => 'hydration_complete'),
        clientEntryPromise.then(() => 'client_entry_loaded'),
      ]);

      await page.goto(`${rootApp.serverUrl}/base/`);

      expect(await hydrationOrClientChunkRace).toBe('client_entry_loaded');
    });
  });

  describe('base-not-preloaded', () => {
    it('client entry chunk loaded should not block hydration if not preloaded', async () => {
      const { page } = await getPageWrapper();

      page.route('**/*', async (route) => {
        if (route.request().url().includes('/base/base-not-preloaded_client@0.0.0-stub.js')) {
          // force client entry chunk to load after main application chunks
          await sleep(200);
        }
        return route.continue();
      });

      const clientEntryPromise = page.waitForResponse((response) =>
        response.url().includes('/base/base-not-preloaded_client@0.0.0-stub.js')
      );
      const hydrationPromise = waitHydrated(page);

      const hydrationOrClientChunkRace = Promise.race([
        hydrationPromise.then(() => 'hydration_complete'),
        clientEntryPromise.then(() => 'client_entry_loaded'),
      ]);

      await page.goto(`${rootApp.serverUrl}/base-not-preloaded/`);

      expect(await hydrationOrClientChunkRace).toBe('hydration_complete');
    });
  });

  describe('errors', () => {
    describe('error during loading child-app code on server side', () => {
      beforeEach(() => {
        mockerHandlerMock.mockImplementation((req) => {
          if (req.url === '/error/error_server@0.0.0-stub.js') {
            throw new Error('blocked');
          }
        });
      });

      it('client entry chunk should be loaded before hydration for failed preloaded', async () => {
        const { page } = await getPageWrapper();

        page.route('**/*', async (route) => {
          if (route.request().url().includes('/error/error_client@0.0.0-stub.js')) {
            await sleep(200);
          }
          return route.continue();
        });

        const clientEntryPromise = page.waitForResponse((response) =>
          response.url().includes('/error/error_client@0.0.0-stub.js')
        );
        const hydrationPromise = waitHydrated(page);

        const hydrationOrClientChunkRace = Promise.race([
          hydrationPromise.then(() => 'hydration_complete'),
          clientEntryPromise.then(() => 'client_entry_loaded'),
        ]);

        await page.goto(`${rootApp.serverUrl}/error/?fallback=`);

        expect(await hydrationOrClientChunkRace).toBe('client_entry_loaded');
      });
    });
  });
});
