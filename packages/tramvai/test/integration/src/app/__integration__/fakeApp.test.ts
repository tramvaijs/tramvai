import { initPlaywright, wrapPlaywrightPage } from '@tramvai/test-pw';
import { runFakeApp } from '../startCliFakeApp';
import type { StartCliResult } from '../startCli';

describe('test/integration/app/runFakeApp', () => {
  jest.setTimeout(10000);

  let app: StartCliResult;

  beforeAll(async () => {
    app = await runFakeApp(
      {
        root: __dirname,
      },
      {
        env: {
          // doesn't know why, but sometimes in CI this app get CONFIG_API value from `test/env.js` file (or from somewere else)
          CONFIG_API: 'test',
        },
      }
    );
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  it('should return 200 status', async () => {
    return app.request('/').expect(200);
  });

  it('should work with papi', async () => {
    const { papi } = app;
    const response = await papi.publicPapi('bundleInfo').expect(200);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "payload": [
          "/",
          "/api/",
          "/second/",
        ],
        "resultCode": "OK",
      }
    `);
  });

  it('should run app', async () => {
    const { application } = await app.render('/');
    expect(application).toMatchInlineSnapshot(`"fake app"`);
  });

  it('should work with playwright', async () => {
    const { browser } = await initPlaywright(app.serverUrl);

    const page = await browser.newPage();

    const wrapper = wrapPlaywrightPage(page);

    await page.goto(app.serverUrl);

    expect(
      await page.$eval('.application', (node) => (node as HTMLElement).innerText)
    ).toMatchInlineSnapshot(`"fake app"`);

    await wrapper.router.navigateThenWaitForReload('./second');

    expect(
      await page.$eval('.application', (node) => (node as HTMLElement).innerText)
    ).toMatchInlineSnapshot(`"second page"`);

    await browser.close();
  });

  it('should work with mocker', async () => {
    await app.mocker.addMocks('CONFIG_API', {
      'GET /test/': {
        status: 200,
        payload: {
          status: 'OK',
          response: 'smth',
        },
      },
    });

    await app.request('/api/').expect(200);

    await app.papi.clearCache();
    await app.mocker.removeMocks('CONFIG_API', ['GET /test/']);

    await app.request('/api/').expect(500);
  });
});
