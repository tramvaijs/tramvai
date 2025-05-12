import path from 'path';
import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';
import fs from 'fs';

jest.setTimeout(30000);

describe('assets', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli('assets', {
      rootDir: path.resolve(__dirname, '../'),
      env: {
        TEST_INLINE_RUNTIME: 'true',
      },
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  it('runtime chunk snapshot', async () => {
    const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);
    const { page } = await getPageWrapper(app.serverUrl);

    fs.writeFileSync('./response.html', await page.content());

    const webpackRuntimeScriptContent = await page.$eval(
      '#webpack-runtime',
      (node) => (node as HTMLElement).innerHTML
    );

    expect(
      webpackRuntimeScriptContent.replace(app.staticUrl, 'http://localhost:4000')
    ).toMatchSnapshot();

    await browser.close();
  });
});
