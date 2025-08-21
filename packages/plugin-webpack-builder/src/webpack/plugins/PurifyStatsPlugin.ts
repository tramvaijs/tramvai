import { Compiler, Compilation, StatsCompilation } from 'webpack';

const targetStatsWriters = {
  'child-app': '@loadable/webpack-plugin',
  application: 'stats-writer-plugin',
} as const;

type BuildTarget = keyof typeof targetStatsWriters;

const getTargetPluginName = (target: BuildTarget) => targetStatsWriters[target];

// Purify unused information from stats.json
export class PurifyStatsPlugin {
  fileName: string;
  target: BuildTarget;

  constructor(options: { fileName: string; target: BuildTarget }) {
    this.fileName = options.fileName;
    this.target = options.target;
  }

  apply(compiler: Compiler) {
    const targetPluginName = getTargetPluginName(this.target);

    compiler.hooks.make.tap(targetPluginName, (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: targetPluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const { fileName } = this;
          const statsJSON: StatsCompilation = JSON.parse(
            compilation.assets[fileName].source().toString()
          );
          const { assets } = statsJSON;

          if (assets) {
            if (this.target === 'application') {
              delete statsJSON.assets;
            } else {
              // @ts-ignore remove extra asset information, but required in type
              statsJSON.assets = assets
                .filter((asset) => /\.(js|mjs|cjs|css)$/.test(asset.name))
                .map(({ name, type, chunks, chunkNames }) => ({
                  name,
                  type,
                  chunks,
                  chunkNames,
                }));
            }
          }

          compilation.updateAsset(
            fileName,
            new compiler.webpack.sources.RawSource(JSON.stringify(statsJSON))
          );
        }
      );
    });
  }
}
