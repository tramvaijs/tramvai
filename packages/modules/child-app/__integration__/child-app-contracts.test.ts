import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getStaticUrl } from '@tramvai/test-integration';
import type { PromiseType } from 'utility-types';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { testCasesConditions } from './test-cases';

jest.setTimeout(4 * 60 * 1000);

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

if (
  rootAppVersion === 'latest' &&
  childAppsVersion === 'latest' &&
  process.env.CHILD_APP_TEST_ISOLATE_DI
) {
  describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
    let childAppContracts: PromiseType<ReturnType<typeof start>> | null;
    let rootApp: PromiseType<ReturnType<typeof startCli>>;

    beforeAll(async () => {
      const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

      [childAppContracts] = await Promise.all([
        rootAppVersion === 'latest' && childAppsVersion === 'latest'
          ? startChildApp('contracts')
          : null,
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
          case 'contracts':
            return reply.from(
              `${
                childAppContracts ? getStaticUrl(childAppContracts) : 'FAKE'
              }/contracts/${filename}`
            );
        }
      });

      await mockerApp.listen({ port: mockerPort });
    });

    beforeAll(async () => {
      const { startRootApp } = await import(`./cross-version-tests/${rootAppVersion}/cli`);

      rootApp = await startRootApp({
        env: {
          CHILD_APP_EXTERNAL_URL: `http://localhost:${mockerPort}/`,
          HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED: 'true',
        },
      });
    });

    const { getPageWrapper } = testAppInBrowser(() => rootApp);

    afterAll(async () => {
      await Promise.all([mockerApp.close(), childAppContracts?.close(), rootApp.close()]);
    });

    beforeEach(() => {
      mockerHandlerMock.mockReset();
    });

    describe('contracts', () => {
      // eslint-disable-next-line jest/expect-expect
      it('contracts and fallbacks works', async () => {
        const { page } = await getPageWrapper('/contracts/');

        await page.waitForFunction(() => (window as any).TEST_CHILD_CONTRACT === true);

        const TEST_CHILD_CONTRACT = await page.evaluate(() => (window as any).TEST_CHILD_CONTRACT);
        const MISSED_CHILD_CONTRACT = await page.evaluate(
          () => (window as any).MISSED_CHILD_CONTRACT
        );
        const MISSED_CHILD_CONTRACT_FALLBACK = await page.evaluate(
          () => (window as any).MISSED_CHILD_CONTRACT_FALLBACK
        );
        const MISSED_HOST_CONTRACT = await page.evaluate(
          () => (window as any).MISSED_HOST_CONTRACT
        );
        const MISSED_HOST_CONTRACT_FALLBACK = await page.evaluate(
          () => (window as any).MISSED_HOST_CONTRACT_FALLBACK
        );

        expect(TEST_CHILD_CONTRACT).toEqual(true);
        expect(MISSED_CHILD_CONTRACT).toEqual(null);
        expect(MISSED_CHILD_CONTRACT_FALLBACK).toEqual('this is child fallback');
        expect(MISSED_HOST_CONTRACT).toEqual(null);
        expect(MISSED_HOST_CONTRACT_FALLBACK).toEqual('this is host fallback');
      });
    });
  });
} else {
  describe('child-app-contracts', () => {
    // eslint-disable-next-line jest/expect-expect
    it('skipped', () => {});
  });
}
