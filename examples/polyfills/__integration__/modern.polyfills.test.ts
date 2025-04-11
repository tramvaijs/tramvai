import path from 'path';
import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import { initPlaywright } from '@tramvai/test-pw';

jest.setTimeout(60000);

describe('polyfills', () => {
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

  it('modern polyfill script exists in html', async () => {
    const { browser, getPageWrapper } = await initPlaywright(app.serverUrl);
    const { page } = await getPageWrapper(app.serverUrl);

    const modernPolyfillScript = await page.$('#modern-polyfills');

    expect(modernPolyfillScript).toBeTruthy();

    await browser.close();
  });
});
