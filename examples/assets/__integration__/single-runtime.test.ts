import path from 'path';
import type { StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';

jest.setTimeout(30000);

describe('assets', () => {
  let app: StartCliResult;

  beforeAll(async () => {
    app = await startCli('assets', {
      rootDir: path.resolve(__dirname, '../'),
    });
  }, 80000);

  afterAll(() => {
    return app.close();
  });

  it('runtime chunk snapshot', async () => {
    const runtimeChunkResponse = await fetch(`${app.staticUrl}/dist/client/runtime.js`);
    const runtimeChunkContent = await runtimeChunkResponse.text();

    expect(runtimeChunkContent.replace(app.staticUrl, 'http://localhost:4000')).toMatchSnapshot();
  });
});
