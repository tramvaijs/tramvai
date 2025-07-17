import { getPolyfillCondition, getMaxBrowserVersionsByFeatures } from './polyfillCondition';

import { Compiler, Compilation } from 'webpack';

const TARGET_PLUGIN_NAME = 'stats-writer-plugin';

export class PolyfillConditionPlugin {
  constructor(private options: { filename: string }) {
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
          const { entrypoints } = compilation;
          const polyfillEntrypoint = entrypoints.get('polyfill');

          // If no polyfill entrypoint presented do nothing
          if (!polyfillEntrypoint) return;

          const polyfillChunk = polyfillEntrypoint.getEntrypointChunk();
          const polyfillModules = compilation.chunkGraph.getChunkModulesIterable(polyfillChunk);
          const coreJsModules = [];

          for (const module of polyfillModules) {
            // @ts-ignore
            if (module.resource && /\/core-js\/modules\//.test(module.resource)) {
              coreJsModules.push(module);
            }
          }

          const features: string[] = coreJsModules
            .map(
              (module) =>
                // @ts-ignore
                getFeatureNameFromModulePath(module.resource)!
            )
            .filter(Boolean);

          const browserVersionsByFeatures = getMaxBrowserVersionsByFeatures(features);
          const polyfillCondition = getPolyfillCondition(browserVersionsByFeatures);
          const { filename } = this.options;
          const statsJSON = JSON.parse(compilation.assets[filename].source().toString());

          statsJSON.polyfillCondition = polyfillCondition;
          statsJSON.features = browserVersionsByFeatures;

          compilation.updateAsset(
            filename,
            new compiler.webpack.sources.RawSource(JSON.stringify(statsJSON))
          );
        }
      );
    });
  }
}

// node_modules/core-js/modules/es.array.push.js => es.array.push
function getFeatureNameFromModulePath(modulePath: string) {
  return modulePath.split('/').at(-1)?.replace(/\.js$/, '');
}
