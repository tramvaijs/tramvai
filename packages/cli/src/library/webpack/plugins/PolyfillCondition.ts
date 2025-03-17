import {
  getPolyfillCondition,
  getMaxBrowserVersionsByFeatures,
} from '../utils/polyfills/polyfillCondition';

const TARGET_PLUGIN_NAME = 'stats-writer-plugin';

export default class PolyfillConditionPlugin {
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
          const { entrypoints } = compilation;
          const polyfillEntrypoint = entrypoints.get('polyfill');

          // If no polyfill entrypoint presented do nothing
          if (!polyfillEntrypoint) return;

          const polyfillChunk = polyfillEntrypoint.getEntrypointChunk();
          const polyfillModules = compilation.chunkGraph.getChunkModulesIterable(polyfillChunk);
          const coreJsModules = [];

          for (const module of polyfillModules) {
            if (module.resource && /\/core-js\/modules\//.test(module.resource)) {
              coreJsModules.push(module);
            }
          }

          const features = coreJsModules.map((module) =>
            getFeatureNameFromModulePath(module.resource)
          );

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
function getFeatureNameFromModulePath(modulePath) {
  return modulePath.split('/').at(-1).replace(/\.js$/, '');
}
