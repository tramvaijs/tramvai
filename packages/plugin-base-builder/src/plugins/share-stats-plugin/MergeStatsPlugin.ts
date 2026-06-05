import type {
  Compiler,
  Compilation as WebpackCompilation,
  StatsCompilation as WebpackStatsCompilation,
} from 'webpack';

import { merge } from './merge';

const PLUGIN_NAME = 'MergeStatsPlugin';

export function getMergeStatsPlugin(Compilation: any) {
  // Merge multiple stats.json
  return class MergeStatsPlugin {
    statsNames: string[];
    currentStatsName: string;

    constructor(options: {
      statsNames: string[];
      currentStatsName: string;
      removeUsedStats?: boolean;
    }) {
      this.currentStatsName = options.currentStatsName;
      this.statsNames = options.statsNames;
    }

    apply(compiler: Compiler & { sharedStore?: Map<string, any> }) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation: WebpackCompilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: PLUGIN_NAME,
            stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const { statsNames, currentStatsName } = this;
            let currentStatsJSON: WebpackStatsCompilation = JSON.parse(
              compilation.assets[currentStatsName].source().toString()
            );

            for (const statsName of statsNames) {
              try {
                const stats = compiler.sharedStore?.get(statsName);
                currentStatsJSON = merge(currentStatsJSON, stats);
              } catch (err) {
                throw new Error(
                  `Failed to process aditional stats ${statsName} with error: ${err}`
                );
              }
            }

            const newAsset = new compiler.webpack.sources.RawSource(
              JSON.stringify(currentStatsJSON)
            );
            compilation.updateAsset(currentStatsName, newAsset);
          }
        );
      });
    }
  };
}
