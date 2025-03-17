import path from 'path';
import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';

jest.setTimeout(30000);

describe('polyfill condition', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli('polyfills', {
      rootDir: path.resolve(__dirname, '../'),
      modern: false,
      fileCache: false,
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  it('polyfill condition exists in html', async () => {
    const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);
    const { page } = await getPageWrapper(app.serverUrl);

    const polyfillConditionScriptContent = await page.$eval(
      '#polyfills',
      (node) => (node as HTMLElement).innerHTML
    );

    expect(
      polyfillConditionScriptContent.replace(app.staticUrl, 'http://localhost:4000')
    ).toMatchSnapshot();

    await browser.close();
  });
});
