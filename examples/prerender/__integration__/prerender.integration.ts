import fs from 'fs';
import path from 'path';
import execa from 'execa';
import { sleep } from '@tramvai/test-integration';
import { testPrerender as test } from './test.fixture';

const appRoot = path.resolve(__dirname, '..');
const staticFolder = path.join(appRoot, 'dist', 'static');

test.describe('tramvai/prerender', async () => {
  // eslint-disable-next-line no-empty-pattern
  test('tramvai static should resolve extra routes from "prerender:routes" hook and support skipped routes in "prerender:generate" hook', async ({}) => {
    await execa('tramvai', ['static', 'prerender'], {
      cwd: appRoot,
      env: {
        ...process.env,
        DANGEROUS_UNSAFE_ENV_FILES: 'true',
      },
    });

    const files = await fs.promises.readdir(staticFolder, { recursive: true });

    const htmlFiles = files.filter((file) => {
      return file.endsWith('.html');
    });

    test
      .expect(htmlFiles.sort())
      // /second/ and /3/test/3/ pages should be skipped
      // should include variations (desktop/mobile) and query parameters
      .toEqual([
        '1/test/1/index.html',
        '2/test/2/index.html',
        'index.desktop.html',
        'index.mobile.html',
        'index.query.html',
        'redirect/index.desktop.html',
        'third/index.desktop.html',
      ]);
  });

  test('fix(TCORE-5403): SPA-navigations works with SWC transpiler', async ({
    page,
    appServer,
    tramvai,
  }) => {
    let errorMessage;

    page.on('pageerror', (error) => {
      if (error.message.includes('Cannot read properties of undefined')) {
        errorMessage = error.message;
      }
    });

    await page.goto(`http://localhost:${appServer.port}/`);

    await tramvai.spaNavigate('/second/');

    await sleep(100);

    const content = await page.textContent('.application');

    test.expect(content).toBe('Second Page');
    test.expect(errorMessage).toBeUndefined();
  });
});
