import path from 'path';
import { build } from '@tramvai/cli';

jest.setTimeout(60000);

// expect build without errors
describe('assets', () => {
  it('separate server build success', async () => {
    await build({
      rootDir: path.resolve(__dirname, '../'),
      target: 'assets',
      buildType: 'server',
    });
  });

  it('separate client build success', async () => {
    await build({
      rootDir: path.resolve(__dirname, '../'),
      target: 'assets',
      buildType: 'client',
    });
  });
});
