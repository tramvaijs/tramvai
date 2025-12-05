import fs from 'fs';
import path from 'path';
import execa from 'execa';
import { test } from './test.fixture';

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

    test
      .expect(
        files.filter((file) => {
          return file.endsWith('.html');
        })
      )
      // /second/ and /3/test/3/ pages should be skipped
      .toEqual(['index.html', '2/test/2/index.html', '1/test/1/index.html']);
  });
});
