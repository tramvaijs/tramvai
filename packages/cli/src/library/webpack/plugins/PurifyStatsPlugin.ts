const targetStatsWriters = {
  'child-app': '@loadable/webpack-plugin',
  application: 'stats-writer-plugin',
} as const;

type BuildTarget = keyof typeof targetStatsWriters;

const getTargetPluginName = (target: BuildTarget) => targetStatsWriters[target];

// Purify unused information from stats.json
export const purifyStatsPluginFactory = (target: BuildTarget) => {
  const targetPluginName = getTargetPluginName(target);

  return class PurifyStatsPlugin {
    fileName: string;

    constructor(options: { fileName: string }) {
      this.fileName = options.fileName;
    }

    apply(compiler) {
      compiler.hooks.make.tap(targetPluginName, (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: targetPluginName,
            stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const { fileName } = this;
            const statsJSON = JSON.parse(compilation.assets[fileName].source().toString());
            const { assets } = statsJSON;

            if (assets) {
              if (target === 'application') {
                delete statsJSON.assets;
              } else {
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
  };
};
