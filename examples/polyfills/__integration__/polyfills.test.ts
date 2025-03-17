import path from 'path';
import fs from 'fs';
import { build } from '@tramvai/cli';
import type { StatsCompilation } from 'webpack';

jest.setTimeout(60000);

describe('polyfills', () => {
  it('stable list of polyfills', async () => {
    await build({
      rootDir: path.resolve(__dirname, '../'),
      target: 'polyfills',
      modern: false,
      withModulesStats: true,
      buildType: 'client',
      fileCache: false,
    });

    const distClientDirectory = path.resolve(__dirname, '../dist', 'client');
    const statsFile = fs.readFileSync(
      path.join(distClientDirectory, 'stats-modules.json'),
      'utf-8'
    );
    const stats: StatsCompilation = JSON.parse(statsFile);

    const polyfillChunk = stats.chunks?.find((chunk) => chunk.id === 'polyfill');

    const polyfillChunkFilename = polyfillChunk?.files?.[0];
    expect(polyfillChunkFilename).toBeTruthy();

    const polyfillChunkModules = polyfillChunk?.modules;
    expect(polyfillChunkModules).toBeTruthy();

    const polyfillModules = polyfillChunkModules!
      .map((item) => item.name)
      .filter((name) => name && !/core-js\/internals/.test(name));

    expect({
      polyfills: polyfillModules,
      polyfillsCount: polyfillModules.length,
    }).toMatchSnapshot('default');
  });
});
