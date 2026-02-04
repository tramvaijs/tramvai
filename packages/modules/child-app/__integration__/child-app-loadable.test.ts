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

// loadable was added after v3.27.2
if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
  describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
    let childAppBase: PromiseType<ReturnType<typeof start>>;
    let childAppLoadable: PromiseType<ReturnType<typeof start>> | null;
    let rootApp: PromiseType<ReturnType<typeof startCli>>;

    beforeAll(async () => {
      const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

      [childAppBase, childAppLoadable] = await Promise.all([
        startChildApp('base'),
        rootAppVersion === 'latest' && childAppsVersion === 'latest'
          ? startChildApp('loadable')
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
          case 'base':
          case 'base-not-preloaded':
            return reply.from(
              `${getStaticUrl(childAppBase)}/base/${filename.replace(/base-not-preloaded/, 'base')}`
            );

          case 'loadable':
            return reply.from(
              `${childAppLoadable ? getStaticUrl(childAppLoadable) : 'FAKE'}/loadable/${filename}`
            );
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

    afterAll(async () => {
      await Promise.all([
        mockerApp.close(),
        childAppBase.close(),
        childAppLoadable?.close(),
        rootApp.close(),
      ]);
    });

    beforeEach(() => {
      mockerHandlerMock.mockReset();
    });

    describe('multi-page and loadable', () => {
      it('loadable page is loaded after direct navigation', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper();

        const loadableAssets: string[] = [];

        page.on('request', (request) => {
          const url = request.url();
          const resourceType = request.resourceType();

          if (
            (resourceType === 'script' || resourceType === 'stylesheet') &&
            url.includes('/loadable/')
          ) {
            loadableAssets.push(url);
          }
        });

        await page.goto(`${serverUrl}/loadable/`);

        // assets for rendered on server-side components
        expect(
          [
            'loadable@0.0.0-stub.css',
            'loadable_client@0.0.0-stub.js',
            'granular-node_modules_date-fns_esm_index_js-node_modules_mini-css-extract-plugin_dist_hmr_hot-04ede6_client.chunk',
            'lazy-cmp_client.chunk',
            'child-apps_loadable_index_ts_client.chunk',
          ].every((assets) => {
            return loadableAssets.some((url) => url.includes(assets));
          })
        ).toBeTruthy();

        expect(await page.locator('#loadable').innerHTML()).toMatchInlineSnapshot(
          `"Child App: <!-- -->I'm little child app"`
        );
        expect(await page.locator('#loadable-actions-list').innerHTML()).toMatchInlineSnapshot(
          `"<li>global-server</li><li>lazy-server</li>"`
        );
      });

      it('loadable page is loaded after SPA-navigation from another Child App', async () => {
        const { serverUrl } = rootApp;
        const { page, router } = await getPageWrapper();

        const loadableAssets: string[] = [];

        page.on('request', (request) => {
          const url = request.url();
          const resourceType = request.resourceType();

          if (
            (resourceType === 'script' || resourceType === 'stylesheet') &&
            url.includes('/loadable/')
          ) {
            loadableAssets.push(url);
          }
        });

        await page.goto(`${serverUrl}/base/`);

        await router.navigate('/loadable/');

        // assets for rendered on server-side components
        expect(
          [
            'loadable@0.0.0-stub.css',
            'loadable_client@0.0.0-stub.js',
            'granular-node_modules_date-fns_esm_index_js-node_modules_mini-css-extract-plugin_dist_hmr_hot-04ede6_client.chunk',
            'lazy-cmp_client.chunk',
            'child-apps_loadable_index_ts_client.chunk',
          ].every((assets) => {
            return loadableAssets.some((url) => url.includes(assets));
          })
        ).toBeTruthy();

        expect(await page.locator('#loadable').innerHTML()).toMatchInlineSnapshot(
          `"Child App: I'm little child app"`
        );
        expect(await page.locator('#loadable-actions-list').innerHTML()).toMatchInlineSnapshot(
          `"<li>global-client</li><li>lazy-client</li>"`
        );
      });

      it('another loadable page is loaded after SPA-navigation from the same Child App', async () => {
        const { serverUrl } = rootApp;
        const { page, router } = await getPageWrapper();

        const loadableAssets: string[] = [];

        await page.goto(`${serverUrl}/loadable/`);

        page.on('request', (request) => {
          const url = request.url();
          const resourceType = request.resourceType();

          if (
            (resourceType === 'script' || resourceType === 'stylesheet') &&
            url.includes('/loadable/')
          ) {
            loadableAssets.push(url);
          }
        });

        await router.navigate('/loadable/bar/');

        // assets for rendered on client-side components
        expect(loadableAssets[0].includes('lazy-cmp-unused_client.chunk')).toBeTruthy();

        expect(
          (await page.locator('#loadable').innerHTML()).replace('<!-- -->', '')
        ).toMatchInlineSnapshot(`"Child App: I'm little child app"`);
        expect(await page.locator('#loadable-actions-list').innerHTML()).toMatchInlineSnapshot(
          `"<li>global-server</li><li>lazy-server</li><li>global-client</li><li>lazy-unused-client</li>"`
        );
      });

      it('actions called between different pages navigation on the same Child App', async () => {
        const { serverUrl } = rootApp;
        const { page, router } = await getPageWrapper();

        await page.goto(`${serverUrl}/loadable/`);

        await router.navigate('/loadable/bar/');

        await router.navigate('/loadable/foo/');

        expect(await page.locator('#loadable-actions-list').innerHTML()).toMatchInlineSnapshot(
          `"<li>global-server</li><li>lazy-server</li><li>global-client</li><li>lazy-unused-client</li><li>global-client</li><li>lazy-client</li>"`
        );
      });
    });
  });
} else {
  describe('child-app-loadable', () => {
    // eslint-disable-next-line jest/expect-expect
    it('skipped', () => {});
  });
}
