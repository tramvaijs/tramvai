import { Compiler, Compilation, StatsCompilation } from 'webpack';

const TARGET_PLUGIN_NAME = 'stats-writer-plugin';

// Generate integrities field for stats.json
export class AssetsIntegritiesPlugin {
  constructor(private options: { fileName: string }) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(TARGET_PLUGIN_NAME, (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: TARGET_PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const { fileName } = this.options;
          const statsJSON: StatsCompilation = JSON.parse(
            compilation.assets[fileName].source().toString()
          );
          const { assets } = statsJSON;

          statsJSON.integrities = assets?.reduce((acc: Record<string, string>, item) => {
            acc[item.name] = item.integrity;
            return acc;
          }, {});

          compilation.updateAsset(
            fileName,
            new compiler.webpack.sources.RawSource(JSON.stringify(statsJSON))
          );
        }
      );
    });
  }
}
