import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getStaticUrl, sleep } from '@tramvai/test-integration';
import type { PromiseType } from 'utility-types';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { testCasesConditions } from './test-cases';
import { renderAppFactory } from './test-utils';

jest.setTimeout(3 * 60 * 1000);

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

describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
  let childAppBase: PromiseType<ReturnType<typeof start>>;
  let childAppState: PromiseType<ReturnType<typeof start>>;
  let childAppCommandline: PromiseType<ReturnType<typeof start>>;
  let rootApp: PromiseType<ReturnType<typeof startCli>>;

  beforeAll(async () => {
    const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

    [childAppBase, childAppState, childAppCommandline] = await Promise.all([
      startChildApp('base'),
      startChildApp('state'),
      startChildApp('commandline'),
    ]);
  });

  const mockerApp = fastify({
    logger: {
      level: 'warn',
    },
  });

  const mockerPort = getPort();
  const mockerHandlerMock = jest.fn();

  beforeAll(async () => {
    await mockerApp.register(fastifyReplyFrom);

    mockerApp.addHook('onRequest', async (req, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
    });
    mockerApp.addHook('preHandler', async (...args) => mockerHandlerMock(...args));

    mockerApp.get('/*', async (request, reply) => {
      const [_, childAppName, filename] = request.url.split('/');

      switch (childAppName) {
        case 'base':
        case 'base-not-preloaded':
          return reply.from(
            `${getStaticUrl(childAppBase)}/base/${filename.replace(/base-not-preloaded/, 'base')}`
          );

        case 'state':
          return reply.from(`${getStaticUrl(childAppState)}/state/${filename}`);

        case 'commandline':
          return reply.from(`${getStaticUrl(childAppCommandline)}/commandline/${filename}`);
      }
    });

    await mockerApp.listen({ port: mockerPort });
  });

  beforeAll(async () => {
    const { startRootApp } = await import(`./cross-version-tests/${rootAppVersion}/cli`);

    rootApp = await startRootApp({
      define: {
        get 'process.env.CHILD_APP_BASE'() {
          return `"${getStaticUrl(childAppBase)}/"`;
        },
      },
      env: {
        CHILD_APP_EXTERNAL_URL: `http://localhost:${mockerPort}/`,
        HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED: 'true',
      },
    });
  });

  const { getPageWrapper } = testAppInBrowser(() => rootApp);

  const renderApp = renderAppFactory(() => rootApp.serverUrl);

  afterAll(async () => {
    await Promise.all([
      mockerApp.close(),
      childAppBase.close(),
      childAppState.close(),
      childAppCommandline.close(),
      rootApp.close(),
    ]);
  });

  beforeEach(() => {
    mockerHandlerMock.mockReset();
  });

  describe('state', () => {
    it('should resolve child-app', async () => {
      const { request } = rootApp;

      await request('/state/').expect(200);

      // useStore is broken in v2.0.0 for parent allowed stores
      const valueFromUseStore = rootAppVersion === 'v2.0.0' ? 0 : 1;

      // eslint-disable-next-line jest/no-interpolation-in-snapshots
      expect(await renderApp('/state/')).toMatchInlineSnapshot(`
                "
                      <h2>Root</h2>
                      <div>
                        Content from root, state:
                        <!-- -->1<!-- -->
                        |
                        <!-- -->1
                      </div>
                      <button id="button" type="button">Update Root State</button><button id="button-another" type="button">Update Another Root State</button>
                      <h3>Child</h3>
                      <div id="child-state">
                        Current Value from Store:
                        <!-- -->server<!-- -->
                        |
                        <!-- -->server
                      </div>
                      <hr>
                      <div id="root-state">
                        Current Values from Root Stores:
                        <!-- -->1<!-- -->
                        |
                        <!-- -->${valueFromUseStore}
                      </div>
                    "
            `);
    });

    it('should update internal state based on root', async () => {
      const { page } = await getPageWrapper('/state/');
      const childCmp = await page.$('#root-state');

      // useStore is broken in v2.0.0 for parent allowed stores
      const valueFromUseStore = rootAppVersion === 'v2.0.0' ? 0 : 1;
      const updatedValueFromUseStore = rootAppVersion === 'v2.0.0' ? 0 : 2;

      expect(
        await childCmp?.evaluate((node) => (node as HTMLElement).innerText)
        // eslint-disable-next-line jest/no-interpolation-in-snapshots
      ).toMatchInlineSnapshot(`"Current Values from Root Stores: 1 | ${valueFromUseStore}"`);

      const button = await page.$('#button');
      const buttonAnother = await page.$('#button-another');

      await button?.click();
      await buttonAnother?.click();

      await sleep(100);

      expect(
        await childCmp?.evaluate((node) => (node as HTMLElement).innerText)
        // eslint-disable-next-line jest/no-interpolation-in-snapshots
      ).toMatchInlineSnapshot(`"Current Values from Root Stores: 2 | ${updatedValueFromUseStore}"`);
    });

    it('should execute action for every transition', async () => {
      const { page, router } = await getPageWrapper('/commandline/');

      const getActionCount = () =>
        page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_ACTION_CALLED_TIMES);

      await page.waitForFunction(
        () => !!(window as any).TRAMVAI_TEST_CHILD_APP_ACTION_CALLED_TIMES,
        { timeout: 15000 }
      );

      expect(await getActionCount()).toBe(1);

      await router.navigate('/base/');

      expect(await getActionCount()).toBe(1);

      await router.navigate('/commandline/');

      expect(await getActionCount()).toBe(2);
    });

    if (rootAppVersion === 'latest' && process.env.CHILD_APP_TEST_ISOLATE_DI) {
      it('should merge child and host app ACTION_CONDITIONALS', async () => {
        const { page } = await getPageWrapper('/state/');

        const getCustomActionCount = () =>
          page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_CUSTOM_CONDITION);
        const getMixedActionCount = () =>
          page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_MIXED_CONDITION);

        expect(await getCustomActionCount()).toBe(1);
        expect(await getMixedActionCount()).toBe(1);
      });
    } else {
      it('should resolve child app ACTION_CONDITIONALS', async () => {
        const { page } = await getPageWrapper('/state/');

        const getCustomActionCount = () =>
          page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_CUSTOM_CONDITION);
        const getMixedActionCount = () =>
          page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_MIXED_CONDITION);

        expect(await getCustomActionCount()).toBe(1);
        expect(await getMixedActionCount()).toBe(0);
      });
    }
  });
});
