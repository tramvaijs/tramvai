import { resolve } from 'path';
import { benchmark } from '@tramvai/cli';

const FIXTURES_DIR = resolve(__dirname, '__fixtures__');

jest.useRealTimers();
jest.setTimeout(120000);

const compilationStats = {
  // TODO: not working in CI, loaders field in report is empty: TCORE-5363
  // loaderBuildCosts: expect.any(Object),
  totalBuildCosts: expect.any(Object),
  pluginBuildCosts: expect.any(Object),
};

describe('@tramvai/cli benchmark command', () => {
  describe('application', () => {
    it('should benchmark application start command', async () => {
      const result = await benchmark({
        command: 'start',
        commandOptions: {
          rootDir: FIXTURES_DIR,
          target: 'app',
          resolveSymlinks: false,
        },
        times: 2,
      });

      expect(result).toMatchObject({
        clientBuildTime: expect.any(Number),
        serverBuildTime: expect.any(Number),
        clientCompilationStats: compilationStats,
        serverCompilationStats: compilationStats,
        maxMemoryRss: expect.any(Number),
      });
    });
  });
});
