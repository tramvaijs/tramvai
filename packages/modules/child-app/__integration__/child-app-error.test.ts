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

// error handling was added after v2.0.0
if (rootAppVersion !== 'v2.0.0') {
  describe(`Cross version test: { rootAppVersion: ${rootAppVersion}, childAppsVersion: ${childAppsVersion} }`, () => {
    let childAppBase: PromiseType<ReturnType<typeof start>>;
    let childAppError: PromiseType<ReturnType<typeof start>>;
    let rootApp: PromiseType<ReturnType<typeof startCli>>;

    beforeAll(async () => {
      const { startChildApp } = await import(`./cross-version-tests/${childAppsVersion}/cli`);

      [childAppBase, childAppError] = await Promise.all([
        startChildApp('base'),
        startChildApp('error'),
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

          case 'error':
            return reply.from(`${getStaticUrl(childAppError)}/error/${filename}`);
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
        childAppError.close(),
        rootApp.close(),
      ]);
    });

    beforeEach(() => {
      mockerHandlerMock.mockReset();
    });
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

        it('client entry chunk should be loaded before hydration for failed preloaded', async () => {
          const { page } = await getPageWrapper();

          page.route('**/*', async (route) => {
            if (route.request().url().includes('/error/error_client@0.0.0-stub.js')) {
              // force client entry chunk to load after main application chunks
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

        if (rootAppVersion === 'latest') {
          it('should log render error', async () => {
            const { serverUrl } = rootApp;
            const errors: any[] = [];

            const { page } = await getPageWrapper();

            const waitForDidCatchMessage = new Promise((resolve) => {
              page.on('console', async (msg) => {
                if (msg.type() === 'error' && msg.args()[2] !== undefined) {
                  const error = await msg.args()[2].jsonValue();
                  if (error?.event === 'component-did-catch') {
                    errors.push(error);
                    resolve(null);
                  }
                }
              });
            });

            await page.goto(`${serverUrl}/error/?renderError=client`);
            await waitForDidCatchMessage;

            expect(errors.length).toBe(1);
            expect(errors[0]).toStrictEqual({
              event: 'component-did-catch',
              message: 'An unexpected error occured during rendering',
              error: expect.any(Object),
              info: expect.any(Object),
              childApp: {
                name: 'error',
                tag: 'latest',
                version: '0.0.0-stub',
              },
            });
          });
        }
      });
    });
  });
} else {
  describe('child-app-error', () => {
    // eslint-disable-next-line jest/expect-expect
    it('skipped', () => {});
  });
}
