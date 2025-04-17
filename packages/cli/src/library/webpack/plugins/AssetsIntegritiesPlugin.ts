const TARGET_PLUGIN_NAME = 'stats-writer-plugin';

// Generate integrities field and remove assets field in stats.json file
export default class AssetsIntegritiesPlugin {
  constructor(private options: { filename: string }) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(TARGET_PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: TARGET_PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const { filename } = this.options;
          const statsJSON = JSON.parse(compilation.assets[filename].source().toString());
          const { assets } = statsJSON;

          statsJSON.integrities = assets.reduce((acc, item) => {
            acc[item.name] = item.integrity;
            return acc;
          }, {});

          delete statsJSON.assets;

          compilation.updateAsset(
            filename,
            new compiler.webpack.sources.RawSource(JSON.stringify(statsJSON))
          );
        }
      );
    });
  }
}
