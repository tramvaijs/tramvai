import path from 'node:path';
import webpack from 'webpack';
import type { Configuration } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { optional } from '@tinkoff/dippy';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { DedupePlugin } from '@tinkoff/webpack-dedupe-plugin';
import { VirtualProtocolPlugin } from './plugins/virtual-protocol-plugin';
import { resolvePublicPathDirectory } from './utils/publicPath';
import {
  WEBPACK_TRANSPILER_TOKEN,
  createTranspilerRules,
  resolveWebpackTranspilerParameters,
} from './shared/transpiler';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { configToEnv } from './shared/config-to-env';
import { WEBPACK_DEBUG_STATS_OPTIONS } from './shared/stats';
import { DEVTOOL_OPTIONS_TOKEN } from './shared/sourcemaps';
import { WebpackConfigurationFactory } from './webpack-config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from './shared/define';
import { WATCH_OPTIONS_TOKEN } from './shared/watch-options';
import { createStylesConfiguration } from './shared/styles';
import { RESOLVE_EXTENSIONS, defaultExtensions } from './shared/resolve';
import { normalizeBrowserslistConfig } from './shared/browserslist';
import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { createSnapshot } from './shared/snapshot';
import { createAssetsRules } from './shared/assets';

export const webpackConfig: WebpackConfigurationFactory = async ({
  di,
}): Promise<Configuration> => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const transpiler = di.get(optional(WEBPACK_TRANSPILER_TOKEN))!;
  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
  const devtool = di.get(optional(DEVTOOL_OPTIONS_TOKEN)) ?? false;
  const watchOptions = di.get(optional(WATCH_OPTIONS_TOKEN));
  const extensions = di.get(optional(RESOLVE_EXTENSIONS)) ?? defaultExtensions;

  const transpilerParameters = resolveWebpackTranspilerParameters({ di });
  const workerPoolConfig = createWorkerPoolConfig({ di });

  const stylesConfiguration = createStylesConfiguration({
    di,
    // we don't need the css on server, but it's needed to generate proper classnames in js
    emitCssChunks: false,
    extractCssPluginOptions: {
      filename: 'server.css',
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const virtualTramvaiConfig = `const appConfig = ${JSON.stringify(config.dehydrate())};
export { appConfig };
export default appConfig;`;

  const browserslistConfig = JSON.stringify(normalizeBrowserslistConfig(config));

  const virtualModulesPlugin = new VirtualModulesPlugin({
    'virtual:tramvai/config': virtualTramvaiConfig,
    // alias from @tramvai/cli/lib/external/config will be resolved to this request
    '/node_modules/virtual:tramvai/config.js': virtualTramvaiConfig,
    'virtual:tramvai/browserslist': `export default ${browserslistConfig}`,
    // alias from @tramvai/cli/lib/external/browserslist-normalized-file-config will be resolved to this request
    '/node_modules/virtual:tramvai/browserslist.js': `export default ${browserslistConfig}`,
  });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';

  // TODO: test cacheUnaffected, lazyCompilation

  // TODO: output.strictModuleExceptionHandling, module.strictExportPresence - do we really need it?

  return {
    target: 'node',
    // context: config.rootDir,
    entry: {
      // TODO: more missed files watchers with absolute path?
      server: resolveAbsolutePathForFile({
        file: config.entryFile,
        sourceDir: config.sourceDir,
        rootDir: config.rootDir,
      }),
      // server: './src/index.ts',
    },
    output: {
      path: resolveAbsolutePathForFolder({ folder: config.outputServer, rootDir: config.rootDir }),
      publicPath: resolvePublicPathDirectory(config.outputServer),
      filename: 'server.js',
      library: {
        type: 'commonjs2',
      },
      // uniqueName are used for various webpack internals
      // currently, we use that value in the ModuleFederation glue code
      uniqueName: `${config.projectType}:${config.projectName}:${config.projectVersion}`,
      // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
      devtoolNamespace: '@tramvai/cli',
      // disable by default for better performance - https://webpack.js.org/guides/build-performance/#output-without-path-info
      pathinfo: config.inspectBuildProcess,
    },
    mode: 'development',
    devtool,
    resolve: {
      // support for https://nodejs.org/api/addons.html
      extensions: [...extensions, '.node'],
      mainFields: ['module', 'main'],
      symlinks: config.resolveSymlinks,
      alias: {
        // backward compatibility for old @tramvai/cli file-system pages mechanism
        '@tramvai/cli/lib/external/pages': '@tramvai/api/lib/virtual/file-system-pages',
        // backward compatibility for old @tramvai/cli config mechanism
        '@tramvai/cli/lib/external/config': 'virtual:tramvai/config',
        ...(isRootErrorBoundaryEnabled
          ? { '@/__private__/error': config.fileSystemPages!.rootErrorBoundaryPath }
          : {}),
        // backward compatibility for old @tramvai/cli normalized browserslist mechanism
        '@tramvai/cli/lib/external/browserslist-normalized-file-config':
          'virtual:tramvai/browserslist',
      },
    },
    watchOptions: config.noServerRebuild
      ? {
          ignored: /.*/,
        }
      : (watchOptions ?? {
          aggregateTimeout: 20,
          ignored: config.inspectBuildProcess
            ? ['**/.git/**']
            : ['**/node_modules/**', '**/.git/**'],
        }),
    optimization: {
      emitOnErrors: false,
    },
    // TODO: check is it configuration optimal?
    stats: {
      preset: 'errors-warnings',
      // disables the compilation success notification, the webpackbar already displays it
      warningsCount: false,
      ...(config.verboseLogging ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
    },
    // TODO: check is it configuration optimal?
    infrastructureLogging: {
      level: 'warn',
      ...(config.verboseLogging ? { level: 'verbose', debug: true } : {}),
      // ...(configManager.verboseLogging
      //   ? {}
      // TODO: TCORE-5273
      //   : { stream: stderrWithWarningFilters }),
    },
    // TODO: pass as experiments.webpack parameter for fast researches
    experiments: {
      futureDefaults: true,
    },
    snapshot: createSnapshot({ config }),
    module: {
      rules: [
        ...createTranspilerRules({ transpiler, transpilerParameters, workerPoolConfig }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di }),
        {
          // test: /[\\/]cli[\\/]lib[\\/]external[\\/]pages.js$/,
          test: /[\\/]api[\\/]lib[\\/]virtual[\\/]file-system-pages.js$/,
          loader: path.resolve(__dirname, './loaders/file-system-pages'),
          enforce: 'pre',
          options: {
            fileSystemPages: config.fileSystemPages!,
            rootDir: config.rootDir,
            sourceDir: config.sourceDir,
            extensions,
          },
        },
      ],
      // TODO: unsafeCache - TCORE-5274
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      virtualModulesPlugin,
      new VirtualProtocolPlugin(),
      ...stylesConfiguration.plugins,
      config.showProgress && new WorkerProgressPlugin({ name: 'server', color: 'orange' }),
      new webpack.DefinePlugin({
        'process.env.BROWSER': false,
        'process.env.SERVER': true,
        'process.env.NODE_ENV': JSON.stringify('development'),
        // https://github.com/node-formidable/formidable/issues/295
        'global.GENTLY': false,
        'process.env.APP_ID': JSON.stringify(config.projectName || 'tramvai'),
        'process.env.APP_VERSION': process.env.APP_VERSION
          ? JSON.stringify(process.env.APP_VERSION)
          : undefined,
        'process.env.HOST_STATIC': JSON.stringify(config.staticHost),
        'process.env.PORT_STATIC': JSON.stringify(config.staticPort),
        ...configToEnv({ config }),
        ...defineOptions.reduce((allOptions, options) => {
          return {
            ...allOptions,
            ...options,
          };
        }, {}),
      }),
      config.dedupe.enabledDev &&
        new DedupePlugin({
          strategy: config.dedupe.strategy,
          ignorePackages: config.dedupe.ignore?.map((ignore) => new RegExp(`^${ignore}`)),
          showLogs: false,
        }),
    ].filter(Boolean),
  };
};
