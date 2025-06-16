import path from 'node:path';
import webpack from 'webpack';
import type { Configuration } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
// @ts-expect-error `"types"` is missing in package exports field, not compatible with `"moduleResolution": "nodenext"`
import WebpackBar from 'webpackbar';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { optional } from '@tinkoff/dippy';
import { VirtualProtocolPlugin } from './plugins/virtual-protocol-plugin';
import { resolvePublicPathDirectory } from './utils/publicPath';
import {
  WEBPACK_TRANSPILER_TOKEN,
  createTranspilerRules,
  resolveWebpackTranspilerParameters,
} from './shared/transpiler';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { resolveAbsolutePathForEntry, resolveAbsolutePathForOutput } from './shared/path';
import { configToEnv } from './shared/config-to-env';
import { WEBPACK_DEBUG_STATS_OPTIONS } from './shared/stats';
import { DEVTOOL_OPTIONS_TOKEN } from './shared/sourcemaps';
import { WebpackConfigurationFactory } from './webpack-config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from './shared/define';
import { WATCH_OPTIONS_TOKEN } from './shared/watch-options';
import { createStylesConfiguration } from './shared/styles';
import { RESOLVE_EXTENSIONS, defaultExtensions } from './shared/resolve';

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

  const virtualModulesPlugin = new VirtualModulesPlugin({
    'virtual:tramvai/config': `const appConfig = ${JSON.stringify(config.dehydrate())};
export { appConfig };
export default appConfig;`,
    // 'node_modules/@tramvai/api/lib/virtual/file-system-pages.js': '',
    // // for integration tests in tramvai repository, resolved symlink path
    // './packages/api/lib/virtual/file-system-pages.js': '',
  });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  // TODO: test cacheUnaffected, lazyCompilation

  return {
    target: 'node',
    // context: config.rootDir,
    entry: {
      // TODO: more missed files watchers with absolute path?
      server: resolveAbsolutePathForEntry({
        entry: config.entryFile,
        sourceDir: config.sourceDir,
        rootDir: config.rootDir,
      }),
      // server: './src/index.ts',
    },
    output: {
      path: resolveAbsolutePathForOutput({ output: config.outputServer, rootDir: config.rootDir }),
      publicPath: resolvePublicPathDirectory(config.outputServer),
      filename: 'server.js',
      libraryTarget: 'commonjs2',
    },
    mode: 'development',
    devtool,
    resolve: {
      extensions,
      mainFields: ['module', 'main'],
      symlinks: config.resolveSymlinks,
      alias: {
        // backward compatibility for old @tramvai/cli file-system pages mechanism
        '@tramvai/cli/lib/external/pages': '@tramvai/api/lib/virtual/file-system-pages',
        // backward compatibility for old @tramvai/cli config mechanism
        '@tramvai/cli/lib/external/config': 'virtual:tramvai/config',
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
      //   : { stream: stderrWithWarningFilters }),
    },
    module: {
      rules: [
        ...createTranspilerRules({ transpiler, transpilerParameters, workerPoolConfig }),
        ...stylesConfiguration.rules,
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
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      virtualModulesPlugin,
      new VirtualProtocolPlugin(),
      ...stylesConfiguration.plugins,
      // new webpack.ProgressPlugin((percentage, message, ...args) => {
      //   // e.g. Output each progress message directly to the console:
      //   console.info(percentage, message, ...args);
      // }),
      // TODO: multi progress bar
      new WebpackBar({
        name: 'server',
        color: 'orange',
      }),
      new webpack.DefinePlugin({
        'process.env.BROWSER': false,
        'process.env.SERVER': true,
        'process.env.NODE_ENV': JSON.stringify('development'),
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
    ],
  };
};
