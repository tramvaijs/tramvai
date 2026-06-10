import type {
  Compiler,
  StatsCompilation as WebpackStatsCompilation,
  Compilation as WebpackCompilation,
} from 'webpack';

const PLUGIN_NAME = 'CollectStatsPlugin';

export function getCollectStatsPlugin(Compilation: any) {
  return class CollectStatsPlugin {
    filename: string;

    constructor(options: { filename: string }) {
      this.filename = options.filename;
    }

    apply(compiler: Compiler & { sharedStore?: Map<string, any> }) {
      compiler.hooks.make.tap(PLUGIN_NAME, (compilation: WebpackCompilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: PLUGIN_NAME,
            stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const { name } = compiler.options;
            const { filename } = this;
            const statsJSON: WebpackStatsCompilation = JSON.parse(
              compilation.assets[filename].source().toString()
            );

            compiler.sharedStore?.set(name!, statsJSON);
          }
        );
      });
    }
  };
}
