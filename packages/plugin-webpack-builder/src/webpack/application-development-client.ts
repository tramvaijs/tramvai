import path from 'node:path';
import webpack from 'webpack';
import type { Configuration, WebpackPluginInstance } from 'webpack';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { optional } from '@tinkoff/dippy';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';
import {
  WEBPACK_DEBUG_STATS_OPTIONS,
  WEBPACK_DEBUG_STATS_FIELDS,
  DEV_STATS_OPTIONS,
  DEV_STATS_FIELDS,
  STATS_FILE_NAME,
} from './shared/stats';
import { resolvePublicPathDirectory } from './utils/publicPath';
import { resolveUrl } from '../utils/url';
import {
  WEBPACK_TRANSPILER_TOKEN,
  createTranspilerRules,
  resolveWebpackTranspilerParameters,
} from './shared/transpiler';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { VirtualProtocolPlugin } from './plugins/virtual-protocol-plugin';
import { configToEnv } from './shared/config-to-env';
import { DEVTOOL_OPTIONS_TOKEN } from './shared/sourcemaps';
import { WebpackConfigurationFactory } from './webpack-config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from './shared/define';
import { WATCH_OPTIONS_TOKEN } from './shared/watch-options';
import { createStylesConfiguration } from './shared/styles';
import { RESOLVE_EXTENSIONS, defaultExtensions } from './shared/resolve';
import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { PolyfillConditionPlugin } from './plugins/polyfill-condition-plugin';

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
    emitCssChunks: true,
    extractCssPluginOptions: {
      filename: '[name].css',
      chunkFilename: '[name].chunk.css',
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const virtualModulesPlugin = new VirtualModulesPlugin({});

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';
  const virtualRootErrorBoundary = require.resolve('@tramvai/api/lib/virtual/root-error-boundary');

  const { polyfill, modernPolyfill, sourceDir, rootDir, showProgress } = config;

  const polyfillPath = safeRequireResolve(
    resolveAbsolutePathForFile({
      file: polyfill ?? './src/polyfill',
      sourceDir,
      rootDir,
    }),
    typeof polyfill === 'undefined'
  );
  const modernPolyfillPath = safeRequireResolve(
    resolveAbsolutePathForFile({
      file: modernPolyfill ?? './src/modern.polyfill',
      sourceDir,
      rootDir,
    }),
    typeof modernPolyfill === 'undefined'
  );

  // TODO: test cacheUnaffected, lazyCompilation

  return {
    // todo browserslist?
    target: 'web',
    // context: config.rootDir,
    entry: {
      // TODO: more missed files watchers with absolute path?
      platform: resolveAbsolutePathForFile({
        file: config.entryFile,
        sourceDir: config.sourceDir,
        rootDir: config.rootDir,
      }),
      ...(polyfillPath
        ? {
            polyfill: polyfillPath,
          }
        : {}),
      ...(modernPolyfillPath
        ? {
            'modern.polyfill': modernPolyfillPath,
          }
        : {}),
      // platform: './src/index.ts',
      ...(isRootErrorBoundaryEnabled ? { rootErrorBoundary: virtualRootErrorBoundary } : {}),
    },
    output: {
      path: resolveAbsolutePathForFolder({
        folder: config.outputClient,
        rootDir: config.rootDir,
      }),
      publicPath: `${resolveUrl({
        host: config.staticHost,
        port: config.staticPort,
        protocol: config.httpProtocol,
      })}${resolvePublicPathDirectory(config.outputClient)}`,
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      crossOriginLoading: 'anonymous',
    },
    mode: 'development',
    devtool,
    resolve: {
      extensions,
      // TODO: es2017, es2016, es2015 fields support?
      mainFields: ['browser', 'module', 'main'],
      symlinks: config.resolveSymlinks,
      alias: {
        // backward compatibility for old @tramvai/cli file-system pages mechanism
        '@tramvai/cli/lib/external/pages': '@tramvai/api/lib/virtual/file-system-pages',
      },
    },
    watchOptions: config.noClientRebuild
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
        ...(isRootErrorBoundaryEnabled
          ? [
              {
                test: new RegExp(virtualRootErrorBoundary),
                loader: path.resolve(__dirname, './loaders/root-error-boundary'),
                enforce: 'pre' as const,
                options: {
                  path: config.fileSystemPages!.rootErrorBoundaryPath,
                },
              },
            ]
          : []),
      ],
    },
    plugins: [
      virtualModulesPlugin,
      new VirtualProtocolPlugin(),
      ...stylesConfiguration.plugins,
      new StatsWriterPlugin({
        filename: STATS_FILE_NAME,
        stats: {
          ...DEV_STATS_OPTIONS,
          ...(config.verboseLogging ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
        },
        fields: [...DEV_STATS_FIELDS, ...(config.verboseLogging ? WEBPACK_DEBUG_STATS_FIELDS : [])],
      }) as any as WebpackPluginInstance,
      showProgress && new WorkerProgressPlugin({ name: 'client', color: 'green' }),
      new PolyfillConditionPlugin({ filename: STATS_FILE_NAME }),
      new webpack.DefinePlugin({
        'process.env.BROWSER': true,
        'process.env.SERVER': false,
        'process.env.NODE_ENV': JSON.stringify('development'),
        // https://github.com/node-formidable/formidable/issues/295
        'global.GENTLY': false,
        'process.env.APP_ID': JSON.stringify(config.projectName || 'tramvai'),
        'process.env.APP_VERSION': process.env.APP_VERSION
          ? JSON.stringify(process.env.APP_VERSION)
          : undefined,
        ...configToEnv({ config }),
        ...defineOptions.reduce((allOptions, options) => {
          return {
            ...allOptions,
            ...options,
          };
        }, {}),
      }),
    ].filter(Boolean),
  };
};
