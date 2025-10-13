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
    const statsJSONResponse = await fetch(`${app.staticUrl}/dist/client/stats.json`);
    const statsJSON = await statsJSONResponse.json();

    delete statsJSON.outputPath;
    delete statsJSON.publicPath;

    statsJSON.chunks = statsJSON.chunks.map(
      (chunk: {
        hash: string;
        rendered?: boolean;
        sizes?: Record<string, number>;
        size?: number;
      }) => {
        chunk.hash = '0';

        // remove unstable fields
        delete chunk.rendered;
        delete chunk.sizes;
        delete chunk.size;

        return chunk;
      }
    );

    expect(JSON.stringify(statsJSON, null, 2)).toMatchSnapshot();
  });
});
