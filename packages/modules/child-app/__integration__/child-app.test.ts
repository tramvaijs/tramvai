import { resolve } from 'path';
import { outputFile } from 'fs-extra';
import { fastify } from 'fastify';
import { fastifyReplyFrom } from '@fastify/reply-from';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import { getStaticUrl, sleep } from '@tramvai/test-integration';
import { renderFactory, requestFactory } from '@tramvai/test-helpers';
import type { PromiseType } from 'utility-types';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { start } from '@tramvai/cli';
import type { startCli } from '@tramvai/test-integration';
import { testCasesConditions } from './test-cases';

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

const { rootAppVersion, childAppsVersion, router, reactQuery } = testCase;

const normalizeSuspense = (html: string) => {
  return (
    html
      .replace(/<template .+><\/template>/gs, '<Suspense />')
      // Remove any comments that are coming from the suspense usage
      // as not every version is using Suspense and snapshots will be different
      // without such normalization
      // TODO: remove after dropping compatibility with v2.0.0
      .replace(/^\s+<!?--\/?\$!?-->\n/gm, '')
      .replace(/<!?--\/?\$!?-->/g, '')
  );
};

const EXAMPLE_DIR = resolve(__dirname, '..', '..', '..', '..', 'examples', 'child-app');
const REFRESH_CMP_PATH = resolve(EXAMPLE_DIR, 'child-apps', 'base', 'innerCmp.tsx');

const REFRESH_CMP_CONTENT_START = `export const InnerCmp = () => {
  return <div id="cmp">Cmp test: start</div>;
};
`;

const REFRESH_CMP_CONTENT_UPDATE = `export const InnerCmp = () => {
  return <div id="cmp">Cmp test: update</div>;
};
`;

describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
  let childAppBase: PromiseType<ReturnType<typeof start>>;
  let childAppState: PromiseType<ReturnType<typeof start>>;
  let childAppRouter: PromiseType<ReturnType<typeof start>>;
  let childAppReactQuery: PromiseType<ReturnType<typeof start>>;
  let childAppError: PromiseType<ReturnType<typeof start>> | null;
  let childAppLoadable: PromiseType<ReturnType<typeof start>> | null;
  let rootApp: PromiseType<ReturnType<typeof startCli>>;

  beforeAll(async () => {
    const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

    await outputFile(REFRESH_CMP_PATH, REFRESH_CMP_CONTENT_START);

    [
      childAppBase,
      childAppState,
      childAppRouter,
      childAppReactQuery,
      childAppError,
      childAppLoadable,
    ] = await Promise.all([
      startChildApp('base'),
      startChildApp('state'),
      startChildApp('router'),
      startChildApp('react-query', {
        shared: {
          deps: ['@tramvai/react-query', '@tramvai/module-react-query'],
        },
      }),
      rootAppVersion !== 'v2.0.0' ? startChildApp('error') : null,
      rootAppVersion === 'latest' && childAppsVersion === 'latest'
        ? startChildApp('loadable')
        : null,
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

        case 'state':
          return reply.from(`${getStaticUrl(childAppState)}/state/${filename}`);

        case 'router':
          // imitate long loading for child-app files
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return reply.from(`${getStaticUrl(childAppRouter)}/router/${filename}`);

        case 'react-query':
          return reply.from(`${getStaticUrl(childAppReactQuery)}/react-query/${filename}`);

        case 'error':
          return reply.from(
            `${childAppError ? getStaticUrl(childAppError) : 'FAKE'}/error/${filename}`
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

  const renderApp = async (page: string) => {
    const request = requestFactory(rootApp.serverUrl);
    const render = renderFactory(
      request,
      // remove wrong </link> tag that was appearing in the old tramvai versions
      // TODO: remove after dropping compatibility with v2.0.0
      { replaceDynamicStrings: { '</link>': '' } }
    );
    const { application } = await render(page, { parserOptions: { comment: true } });

    return normalizeSuspense(application);
  };

  afterAll(async () => {
    await Promise.all([
      mockerApp.close(),
      childAppBase.close(),
      childAppState.close(),
      childAppRouter.close(),
      childAppReactQuery.close(),
      childAppError?.close(),
      childAppLoadable?.close(),
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

      router.navigate('/base/');

      expect(await getActionCount()).toBe(1);
    });
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
      const { page, router } = await getPageWrapper('/state/');

      const getActionCount = () =>
        page.evaluate(() => (window as any).TRAMVAI_TEST_CHILD_APP_ACTION_CALLED_TIMES);

      expect(await getActionCount()).toBe(1);

      await router.navigate('/base/');

      expect(await getActionCount()).toBe(1);

      await router.navigate('/state/');

      expect(await getActionCount()).toBe(2);
    });
  });

  describe('router', () => {
    it('should prefetch childApps based on link to another route', async () => {
      const reactQueryStaticUrl = `http://localhost:${mockerPort}/react-query/`;
      const reactQueryAssets: string[] = [];
      const { page } = await getPageWrapper();

      page.on('request', (request) => {
        if (request.resourceType() === 'script' && request.url().startsWith(reactQueryStaticUrl)) {
          reactQueryAssets.push(request.url());
        }
      });

      await page.goto(`${rootApp.serverUrl}/router/`);

      expect(reactQueryAssets).toHaveLength(0);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await sleep(100);

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
            Link to /react-query"
          `);
      });
    }
  });
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
                      <div>Hello, Mock!</div>
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

      await page.goto(`${serverUrl}/react-query/`);

      expect(loadedScripts).toHaveLength(reactQuery.scriptsCount);
    });
  });

  // error handling was added after v2.0.0
  if (rootAppVersion !== 'v2.0.0') {
    describe('errors', () => {
      describe('error during loading child-app code', () => {
        beforeEach(() => {
          mockerHandlerMock.mockImplementation(() => {
            throw new Error('blocked');
          });
        });

        it('should render nothing', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/').expect(200),
            renderApp('/error/'),
            getPageWrapper('/error/'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('should render fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?fallback=').expect(200),
            renderApp('/error/?fallback='),
            getPageWrapper('/error/?fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                            <div id="fallback">Fallback component</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });

        it('should render error on spa transition', async () => {
          const { page, router } = await getPageWrapper('/base/');

          await router.navigate('/error/');

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('should render error fallback on spa transition', async () => {
          const { page, router } = await getPageWrapper('/base/');

          await router.navigate('/error/?fallback=');

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });
      });

      describe('error during loading child-app code on server side', () => {
        beforeEach(() => {
          mockerHandlerMock.mockImplementation((req) => {
            if (req.url === '/error/error_server@0.0.0-stub.js') {
              throw new Error('blocked');
            }
          });
        });

        it('should render nothing', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/').expect(200),
            renderApp('/error/'),
            getPageWrapper('/error/'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="error">Child App</div>"`
          );
        });

        it('should render fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?fallback=').expect(200),
            renderApp('/error/?fallback='),
            getPageWrapper('/error/?fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                            <div id="fallback">Fallback component</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="error">Child App</div>"`
          );
        });

        it('should render component on spa transition', async () => {
          const { page, router } = await getPageWrapper('/base/');

          await router.navigate('/error/');

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<!--$--><!--/$--><div>Error page still works</div><div id="error">Child App</div>"`
          );
        });
      });

      describe('error during loading child-app code on client side', () => {
        beforeEach(() => {
          mockerHandlerMock.mockImplementation((req) => {
            if (req.url === '/error/error_client@0.0.0-stub.js') {
              throw new Error('blocked');
            }
          });
        });

        it('should render nothing', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/').expect(200),
            renderApp('/error/'),
            getPageWrapper('/error/'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <div id="error">Child App</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('should render fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?fallback=').expect(200),
            renderApp('/error/?fallback='),
            getPageWrapper('/error/?fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <div id="error">Child App</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });

        it('should render error on spa transition', async () => {
          const { page, router } = await getPageWrapper('/base/');

          await router.navigate('/error/');

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<!--$--><!--/$--><div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('should render error fallback on spa transition', async () => {
          const { page, router } = await getPageWrapper('/base/');

          await router.navigate('/error/?fallback=');

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<!--$--><!--/$--><div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });
      });

      describe('error during render', () => {
        it('error both on server and client', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=all').expect(200),
            renderApp('/error/?renderError=all'),
            getPageWrapper('/error/?renderError=all'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('error both on server and client with fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=all&fallback=').expect(200),
            renderApp('/error/?renderError=all&fallback='),
            getPageWrapper('/error/?renderError=all&fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                            <div id="fallback">Fallback component</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });

        it('error only on server-side', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=server').expect(200),
            renderApp('/error/?renderError=server'),
            getPageWrapper('/error/?renderError=server'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="error">Child App</div>"`
          );
        });

        it('error only on server-side with fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=server&fallback=').expect(200),
            renderApp('/error/?renderError=server&fallback='),
            getPageWrapper('/error/?renderError=server&fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <Suspense />
                            <div id="fallback">Fallback component</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="error">Child App</div>"`
          );
        });

        it('error only on client-side', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=client').expect(200),
            renderApp('/error/?renderError=client'),
            getPageWrapper('/error/?renderError=client'),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <div id="error">Child App</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div><div style="text-align: center; margin-bottom: 11px; padding-top: 26px; font-size: 30px; line-height: 36px; font-weight: 200;">An error occurred :(</div><div style="text-align: center; margin-bottom: 17px; color: rgb(146, 153, 162); font-size: 20px; line-height: 24px;">Try <a href="">reloading the page</a></div></div>"`
          );
        });

        it('error only on client-side with fallback', async () => {
          const { request } = rootApp;

          const [_, application, { page }] = await Promise.all([
            request('/error/?renderError=client&fallback=').expect(200),
            renderApp('/error/?renderError=client&fallback='),
            getPageWrapper('/error/?renderError=client&fallback='),
          ]);

          expect(application).toMatchInlineSnapshot(`
                      "
                            <div>Error page still works</div>
                            <div id="error">Child App</div>
                          "
                  `);

          expect(await page.locator('.application').innerHTML()).toMatchInlineSnapshot(
            `"<div>Error page still works</div><div id="fallback">Error fallback</div>"`
          );
        });
      });
    });
  }

  // loadable was added after v3.27.2
  if (rootAppVersion === 'latest' && childAppsVersion === 'latest') {
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
            'examples_child-app_child-apps_loadable_index_ts_client.chunk',
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
            'examples_child-app_child-apps_loadable_index_ts_client.chunk',
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

        expect(await page.locator('#loadable').innerHTML()).toMatchInlineSnapshot(
          `"Child App: <!-- -->I'm little child app"`
        );
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
  }
});
