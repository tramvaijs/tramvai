import { resolve } from 'path';
import { outputFile } from 'fs-extra';
import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getStaticUrl, sleep } from '@tramvai/test-integration';
import type { PromiseType } from 'utility-types';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { waitHydrated } from '@tramvai/test-pw';
import { testCasesConditions } from './test-cases';
import { renderAppFactory } from './test-utils';

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

const { rootAppVersion, childAppsVersion, router, reactQuery } = testCase;

const EXAMPLE_DIR = resolve(__dirname, '..', '..', '..', '..', 'examples', 'child-app');
const REFRESH_CMP_PATH = resolve(EXAMPLE_DIR, 'child-apps', 'base', 'innerCmp.tsx');

const REFRESH_CMP_CONTENT_START = `export const InnerCmp = () => {
  return (
    <div id="cmp" suppressHydrationWarning>
      Cmp test: start
    </div>
  );
};
`;

const REFRESH_CMP_CONTENT_UPDATE = `export const InnerCmp = () => {
  return (
    <div id="cmp" suppressHydrationWarning>
      Cmp test: update
    </div>
  );
};
`;

describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
  let childAppBase: PromiseType<ReturnType<typeof start>>;
  let childAppRouter: PromiseType<ReturnType<typeof start>>;
  let childAppReactQuery: PromiseType<ReturnType<typeof start>>;
  let childAppError: PromiseType<ReturnType<typeof start>>;
  let rootApp: PromiseType<ReturnType<typeof startCli>>;

  beforeAll(async () => {
    const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

    await outputFile(REFRESH_CMP_PATH, REFRESH_CMP_CONTENT_START);

    [childAppBase, childAppRouter, childAppError, childAppReactQuery] = await Promise.all([
      startChildApp('base'),
      startChildApp('router'),
      startChildApp('error'),
      startChildApp('react-query', {
        shared: {
          deps: ['@tramvai/react-query', '@tramvai/module-react-query'],
        },
      }),
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

        case 'router':
          // imitate long loading for child-app files
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return reply.from(`${getStaticUrl(childAppRouter)}/router/${filename}`);

        case 'react-query':
          return reply.from(`${getStaticUrl(childAppReactQuery)}/react-query/${filename}`);
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
      childAppRouter.close(),
      childAppReactQuery.close(),
      childAppError.close(),
      rootApp.close(),
    ]);
  });

  beforeEach(() => {
    mockerHandlerMock.mockReset();
  });

  describe('base', () => {
    afterAll(async () => {
      await outputFile(REFRESH_CMP_PATH, REFRESH_CMP_CONTENT_START);
    });

    it('should resolve child-app', async () => {
      const { request } = rootApp;

      await request('/base/').expect(200);

      expect(await renderApp('/base/')).toMatchInlineSnapshot(`
          "
                <div>Content from root</div>
                <div id="base">
                  Child App:
                  <!-- -->I&#x27;m little child app
                </div>
                <div id="cmp">Cmp test: start</div>
              "
        `);
    });

    it('react-refresh should work', async () => {
      const { page } = await getPageWrapper('/base/');

      expect(
        await page.$eval('#cmp', (node) => (node as HTMLElement).innerText)
      ).toMatchInlineSnapshot(`"Cmp test: start"`);

      await outputFile(REFRESH_CMP_PATH, REFRESH_CMP_CONTENT_UPDATE);

      await page.waitForFunction(
        () => {
          return document.getElementById('cmp')?.innerHTML !== 'Cmp test: start';
        },
        { polling: 2000, timeout: 10000 }
      );

      expect(
        await page.$eval('#cmp', (node) => (node as HTMLElement).innerText)
      ).toMatchInlineSnapshot(`"Cmp test: update"`);
    });

    it('should use host app ACTION_CONDITIONALS', async () => {
      const { page } = await getPageWrapper('/base/');

      const getActionCount = () =>
        page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_FACTORY_CONDITION);

      expect(await getActionCount()).toBe(1);
    });

    if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
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
    }
  });

  describe('base-not-preloaded', () => {
    it('should render child app only after page load', async () => {
      const { request } = rootApp;

      await request('/base-not-preloaded/').expect(200);

      expect(await renderApp('/base-not-preloaded/')).not.toContain('Child App');

      const { page, router } = await getPageWrapper('/base-not-preloaded/');

      const getActionCount = () =>
        page.evaluate(
          () => (window as any).TRAMVAI_TEST_CHILD_APP_NOT_PRELOADED_ACTION_CALL_NUMBER
        );

      await page.waitForSelector('#base', {
        state: 'visible',
      });

      expect(
        await page.evaluate(() => document.querySelector('.application')?.innerHTML)
      ).toContain('Child App');

      expect(await getActionCount()).toBe(1);

      const navigation = router.navigate('/base/');

      expect(await getActionCount()).toBe(1);

      await navigation;
    });

    if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
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
    }
  });

  describe('router', () => {
    it('should prefetch childApps based on link to another route', async () => {
      const reactQueryStaticUrl = `http://localhost:${mockerPort}/react-query/`;
      const reactQueryAssets: string[] = [];
      const { page } = await getPageWrapper();

      const prefetchPromise = new Promise<void>((resolve, reject) => {
        page.on('request', (request) => {
          if (
            request.resourceType() === 'script' &&
            request.url().startsWith(reactQueryStaticUrl)
          ) {
            reactQueryAssets.push(request.url());
          }

          if (reactQueryAssets.length === router.prefetchScriptsCount) {
            resolve();
          }
        });

        if (reactQueryAssets.length === router.prefetchScriptsCount) {
          resolve();
        }
      });

      await page.goto(`${rootApp.serverUrl}/router/`);

      expect(reactQueryAssets).toHaveLength(0);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await prefetchPromise;

      expect(reactQueryAssets).toHaveLength(router.prefetchScriptsCount);
    });

    if (router.nonBlockingSpa) {
      it('should not block spa navigations with child-app preload', async () => {
        const { page, router } = await getPageWrapper('/base');

        const navigatePromise = router.navigate('/router');

        await sleep(100);

        expect(await page.innerText('#root-route')).toBe('Current route: /router/');
        expect(await page.innerText('#router')).toBe('Loading...');

        await navigatePromise;

        expect(await page.innerText('#root-route')).toBe('Current route: /router/');
        expect(await page.innerText('#router')).toMatchInlineSnapshot(`
            "Actual Path: /router/

            Amazing children

            Link to /react-query"
          `);
      });
    }
  });
  if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
    describe('child app lifecycle hooks', () => {
      it('child app mounted event', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper('/monitoring');
        await page.goto(`${serverUrl}/monitoring?lifecycle=render`);

        await page.waitForFunction((text) => {
          return document.querySelector('#events')?.textContent?.trim() === text;
        }, 'preload on server,running customer on server,running customer on client,child-app-mounted');
      });

      it('child app mount failed event', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper('/monitoring');

        await page.goto(`${serverUrl}/monitoring?lifecycle=render&childApp=error&renderError=all`);
        await page.waitForFunction((text) => {
          return document.querySelector('#events')?.textContent?.trim() === text;
        }, 'preload on server,running customer on server,running customer on client,preload on client,running customer on client,child-app-mount-failed');
      });

      it('child app config resolution event', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper('/monitoring');

        await page.goto(`${serverUrl}/monitoring?lifecycle=configResolution&childApp=base`);
        await page.waitForFunction((text) => {
          return document.querySelector('#events')?.textContent?.trim() === text;
        }, 'child-app fetch config event,preload on server,running customer on server,running customer on client');
      });
    });

    describe('retry render', () => {
      it('should be possible retry render on client fail', async () => {
        const { serverUrl } = rootApp;

        const { page } = await getPageWrapper('/preload-error?renderChildApp=true');

        await page.route('**/*', async (route) => {
          if (route.request().url().includes('/base/base_client@0.0.0-stub.js')) {
            return route.abort();
          }
          return route.continue();
        });
        await page.goto(`${serverUrl}/preload-error?renderChildApp=true`);

        await page.unroute('**/*');
        const childAppCount = await page.locator('#cmp').count();
        expect(childAppCount).toBe(0);
        await page.waitForFunction((text) => {
          return document.querySelector('.preloaded')?.textContent?.trim() === text;
        }, 'Preloaded:');
        await page
          .locator('button', {
            hasText: 'Preload child-app: base',
          })
          .click();

        await page.waitForFunction((text) => {
          return document.querySelector('.preloaded')?.textContent === text;
        }, 'Preloaded: base');
        const childAppBaseCount = await page.locator('#cmp').count();
        expect(childAppBaseCount).toBe(1);
      });
    });

    describe('retry on failed preload', () => {
      it('should be possible to retry failed prefetched child-app', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper('/preload-error');
        await page.route('**/*', async (route) => {
          if (route.request().url().includes('/client-hints/client-hints_client@0.0.0-stub.js')) {
            return route.abort();
          }
          return route.continue();
        });
        await page.goto(`${serverUrl}/preload-error`);
        await page
          .locator('button', {
            hasText: 'Prefetch child-app: client-hints',
          })
          .click();
        await page.unroute('**/*');
        await page.waitForFunction((text) => {
          const failedPreloadChildAppText = document.querySelector('.failed')?.textContent;
          return failedPreloadChildAppText === text;
        }, 'Failed: client-hints');
        await page
          .locator('button', {
            hasText: 'Prefetch child-app: client-hints',
          })
          .click();
        await page.waitForFunction((text) => {
          const preloadedChildAppTextContent = document.querySelector('.preloaded')?.textContent;
          return preloadedChildAppTextContent === text;
        }, 'Preloaded: client-hints');
      });
      it('should be possible to retry failed preloaded child-app', async () => {
        const { serverUrl } = rootApp;
        const { page } = await getPageWrapper('/preload-error');
        await page.route('**/*', async (route) => {
          if (route.request().url().includes('/base/base_client@0.0.0-stub.js')) {
            return route.abort();
          }
          return route.continue();
        });

        await page.goto(`${serverUrl}/preload-error`);

        await page
          .locator('button', {
            hasText: 'Preload child-app: base',
          })
          .click();
        await page.unroute('**/*');

        await page.waitForFunction((text) => {
          const failedPreloadChildAppText = document.querySelector('.failed')?.textContent;
          return failedPreloadChildAppText === text;
        }, 'Failed: base');

        await page
          .locator('button', {
            hasText: 'Preload child-app: base',
          })
          .click();
        await page.waitForFunction((text) => {
          return document.querySelector('.preloaded')?.textContent === text;
        }, 'Preloaded: base');

        const scriptLocator = page.locator(
          `script[src="http://localhost:${mockerPort}/base/base_client@0.0.0-stub.js"]`
        );
        const scriptCount = await scriptLocator.count();
        const scriptLoaded = await scriptLocator.getAttribute('loaded');

        expect(scriptCount).toBe(1);
        expect(scriptLoaded).toBe('true');
      });
    });
  }

  describe('react-query', () => {
    it('should work with react-query', async () => {
      const { request } = rootApp;

      await request('/react-query/').expect(200);

      expect(await renderApp('/react-query/')).toMatchInlineSnapshot(`
                "
                      <div>
                        Content from root:
                        <!-- -->test
                      </div>
                      <div id="child-react-query">Hello, Mock!</div>
                    "
            `);
    });

    it('should reuse react-query dependencies from root-app', async () => {
      const { serverUrl } = rootApp;
      const { page } = await getPageWrapper();

      const loadedScripts: string[] = [];

      page.on('request', (request) => {
        const url = request.url();
        const resourceType = request.resourceType();

        if (resourceType === 'script' && url.includes('/react-query/')) {
          loadedScripts.push(url);
        }
      });

      await page.goto(`${serverUrl}/react-query/`, { waitUntil: 'domcontentloaded' });

      expect(loadedScripts).toHaveLength(reactQuery.scriptsCount);
    });
  });
});
