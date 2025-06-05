import path from 'node:path';
import fs from 'node:fs';
import { build } from '@tramvai/cli';

jest.setTimeout(3 * 60 * 1000);

const childAppName = 'header';

describe(`latest stats generation test`, () => {
  beforeAll(async () => {
    await build({
      target: childAppName,
      rootDir: path.resolve(__dirname, '../'),
      fileCache: false,
      env: {
        NODE_ENV: 'production',
      },
    });
  });

  describe('stats', () => {
    it('should build stats.json', async () => {
      const distClientDirectory = path.resolve(__dirname, '../dist', 'child-app');
      const statsJSON = JSON.parse(
        fs.readFileSync(
          path.join(distClientDirectory, `${childAppName}_stats_loadable@0.0.0-stub.json`),
          'utf-8'
        )
      );

      const staticAssets = statsJSON.assets.filter(
        (asset: { name: string }) => !/(js|css)$/.test(asset.name)
      );

      expect(staticAssets.length).toEqual(0);

      delete statsJSON.outputPath;
      delete statsJSON.hash;
      delete statsJSON.publicPath;

      // assets is very unstable for snapshot comparing
      delete statsJSON.assets;

      expect(
        JSON.stringify(statsJSON, null, 2)
          .replace(/_es_js/g, '_js')
          .replace(/_js-_.*"/g, '_js"')
          .replace(/\.chunk\..*\.js"/g, '.chunk.js"')
      ).toMatchSnapshot();
    });
  });
});
