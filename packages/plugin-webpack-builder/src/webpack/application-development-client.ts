/* eslint-disable max-statements, complexity */
import path from 'node:path';
import { Writable } from 'node:stream';
import webpack from 'webpack';
import type { Configuration, WebpackPluginInstance } from 'webpack';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import VirtualModulesPlugin from 'webpack-virtual-modules';
// @ts-expect-error
import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';

import flatten from '@tinkoff/utils/array/flatten';
import { optional } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';
import { DedupePlugin } from '@tinkoff/webpack-dedupe-plugin';

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
import { WebpackConfigurationFactory } from './webpack-config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from './shared/define';
import { createStylesConfiguration } from './shared/styles';
import {
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
  RESOLVE_ALIAS_TOKEN,
  defaultExtensions,
  createResolveOptions,
} from './shared/resolve';
import { createSnapshot } from './shared/snapshot';
import { createSplitChunksOptions } from './shared/split-chunks';
import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { PolyfillConditionPlugin } from './plugins/polyfill-condition-plugin';
import { createAssetsRules } from './shared/assets';
import { WEBPACK_EXTERNALS_TOKEN } from './shared/externals';
import { WEBPACK_PLUGINS_TOKEN } from './shared/plugins';
import { createOptimizeOptions } from './shared/optimization';
import { AssetsIntegritiesPlugin } from './plugins/AssetsIntegritiesPlugin';
import { PurifyStatsPlugin } from './plugins/PurifyStatsPlugin';
import { PROVIDE_TOKEN } from './shared/provide';
import { CACHE_ADDITIONAL_FLAGS_TOKEN, createCacheConfig } from './shared/cache';
import { normalizeBrowserslistConfig } from './shared/browserslist';
import { ignoreWarnings } from './utils/warningsFilter';
import { createSourceMaps } from './shared/sourcemaps';
import { ModuleFederationFixRange } from './plugins/ModuleFederationFixRange';
import { ModuleFederationIgnoreEntries } from './plugins/ModuleFederationIgnoreEntries';
import { getSharedModules } from './shared/shared-modules';
import { getAnalyzeRsdoctorOptions, getBenchmarkRsdoctorOptions } from './shared/rsdoctor';

const mainFields = ['browser', 'module', 'main'];

const filters = ignoreWarnings.map(
  ({ message }) =>
    (text: string) =>
      message.test(text)
);

const stderrWithWarningFilters = new Writable({
  write(chunk, encoding, callback) {
    const chunkStr = chunk.toString();

    if (filters.some((filter) => filter(chunkStr))) {
      callback();
      return;
    }

    process.stderr.write(chunk, encoding, callback);
  },
});

stderrWithWarningFilters.on('error', (error: Error) =>
  console.error('[infrastructureLogging] stream error', error)
);

export const webpackConfig: WebpackConfigurationFactory = async ({
  di,
}): Promise<Configuration> => {
  const config = di.get(CONFIG_SERVICE_TOKEN);

  const {
    polyfill,
    modernPolyfill,
    sourceDir,
    rootDir,
    showProgress,
    hotRefresh,
    integrity,
    projectType,
    verboseLogging,
  } = config;

  const transpiler = di.get(optional(WEBPACK_TRANSPILER_TOKEN))!;
  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
  const externals = di.get(optional(WEBPACK_EXTERNALS_TOKEN)) ?? ([] as string[]);
  const plugins = di.get(optional(WEBPACK_PLUGINS_TOKEN)) ?? [];
  const extensions = di.get(optional(RESOLVE_EXTENSIONS_TOKEN)) ?? defaultExtensions;
  const fallback = di.get(optional(RESOLVE_FALLBACK_TOKEN)) ?? {};
  const alias = di.get(optional(RESOLVE_ALIAS_TOKEN)) ?? {};
  const provideList = di.get(optional(PROVIDE_TOKEN)) ?? {};
  const additionalCacheFlags = di.get(optional(CACHE_ADDITIONAL_FLAGS_TOKEN)) ?? [];
  const webpackConfigExtension = config.extensions.webpack();

  Object.assign(fallback, webpackConfigExtension.resolveFallback);
  Object.assign(alias, webpackConfigExtension.resolveAlias);
  Object.assign(provideList, webpackConfigExtension.provide);

  const transpilerParameters = resolveWebpackTranspilerParameters({ di });
  const workerPoolConfig = createWorkerPoolConfig({ di });

  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);
  const browserslistConfig = JSON.stringify(normalizedBrowserslistConfig);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: true,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    extractCssPluginOptions: {
      filename: '[name].css',
      chunkFilename: '[name].chunk.css',
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const virtualModulesPlugin = new VirtualModulesPlugin({
    // TCORE-5228 FIXME: when `@tramvai/cli/lib/external/config` import is used, it will resolve to `/node_modules/virtual:tramvai/browserslist.js`,
    // and this virtual module marked as removed by webpack, and it leads to immediate rebuild after initial compilation
    // 'virtual:tramvai/browserslist': `export default ${browserslistConfig}`,
    // alias from @tramvai/cli/lib/external/browserslist-normalized-file-config will be resolved to this request
    '/node_modules/virtual:tramvai/browserslist.js': `export default ${browserslistConfig}`,
  });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';
  const virtualRootErrorBoundary = require.resolve('@tramvai/api/lib/virtual/root-error-boundary');

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

  // TODO: output.strictModuleExceptionHandling, module.strictExportPresence - do we really need it?

  const sourceMapsConfiguration = createSourceMaps({ config, target: 'client' });

  const resolveOptions = await createResolveOptions({ di, mainFields });

  return {
    // https://webpack.js.org/configuration/target/#browserslist
    target: normalizedBrowserslistConfig.defaults
      ? // unknown support for UCAndroid browser lead to false checks for some ES features
        // https://github.com/webpack/webpack/blob/914db1f7ca1ff6ed4eba015b6765add9afac35e3/lib/config/browserslistTargetHandler.js#L212
        `browserslist:${normalizedBrowserslistConfig.defaults.filter((query) => !query.includes('UCAndroid'))}`
      : 'web',
    // context: config.rootDir,
    entry: {
      // TODO: more missed files watchers with absolute path?
      platform: {
        import: [
          resolveAbsolutePathForFile({
            file: config.entryFile,
            sourceDir: config.sourceDir,
            rootDir: config.rootDir,
          }),
          'webpack-hot-middleware/client?name=client&dynamicPublicPath=true&path=__webpack_hmr&reload=true',
        ].filter(Boolean) as string[],
      },
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
    cache: createCacheConfig({
      config,
      additionalCacheFlags,
      transpilerParameters,
      target: 'client',
    }),
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
      // uniqueName are used for various webpack internals
      // currently, we use that value in the ModuleFederation glue code
      uniqueName: `${config.projectType}:${config.projectName}:${config.projectVersion}`,
      // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
      devtoolNamespace: '@tramvai/cli',
      // disable by default for better performance - https://webpack.js.org/guides/build-performance/#output-without-path-info
      pathinfo: config.inspectBuildProcess,
    },
    mode: 'development',
    devtool: config.sourceMap ? sourceMapsConfiguration.devtool : webpackConfigExtension.devtool,
    node: {
      // "warn" with `futureDefaults`
      global: true,
    },
    resolve: {
      extensions,
      // TODO: es2017, es2016, es2015 fields support?
      mainFields,
      symlinks: config.resolveSymlinks,
      fallback: {
        path: 'path-browserify',
        ...fallback,
      },
      alias: {
        // backward compatibility for old @tramvai/cli file-system pages mechanism
        '@tramvai/cli/lib/external/pages': '@tramvai/api/lib/virtual/file-system-pages',
        // backward compatibility for old @tramvai/cli normalized browserslist mechanism
        '@tramvai/cli/lib/external/browserslist-normalized-file-config':
          'virtual:tramvai/browserslist',
        ...alias,
      },
      plugins: [...resolveOptions.plugins],
    },
    watchOptions: config.noClientRebuild
      ? {
          ignored: /.*/,
        }
      : (webpackConfigExtension.watchOptions ?? {
          aggregateTimeout: 20,
          ignored: config.inspectBuildProcess
            ? ['**/.git/**']
            : ['**/node_modules/**', '**/.git/**'],
        }),
    optimization: {
      emitOnErrors: false,
      ...createSplitChunksOptions({ config }),
      ...createOptimizeOptions({ config, target: 'client' }),
    },
    // TODO: check is it configuration optimal?
    stats: {
      preset: 'errors-warnings',
      // disables the compilation success notification, the webpackbar already displays it
      warningsCount: false,
      ...(verboseLogging ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    // TODO: check is it configuration optimal?
    infrastructureLogging: {
      level: 'warn',
      ...(verboseLogging ? { level: 'verbose', debug: true } : {}),
      ...(verboseLogging ? {} : { stream: stderrWithWarningFilters }),
    },
    // TODO: pass as experiments.webpack parameter for fast researches
    experiments: {
      futureDefaults: true,
    },
    snapshot: createSnapshot({ config }),
    externals: [
      ...flatten<RegExp>(externals),
      ...(Array.isArray(webpackConfigExtension.externals)
        ? webpackConfigExtension.externals
        : (webpackConfigExtension.externals?.development ?? [])),
    ].map((s) => new RegExp(`^${s}`)),
    module: {
      parser: {
        javascript: {
          // "error" with `futureDefaults`
          exportsPresence: 'warn',
        },
      },
      unsafeCache: true,
      rules: [
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
          workerPoolConfig,
        }),
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
        ...(config.sourceMap ? sourceMapsConfiguration.rules : []),
      ],
    },
    plugins: [
      virtualModulesPlugin,
      new VirtualProtocolPlugin(),
      config.benchmark && new RsdoctorWebpackPlugin(getBenchmarkRsdoctorOptions('client')),
      config.analyze && new RsdoctorWebpackPlugin(getAnalyzeRsdoctorOptions()),
      ...stylesConfiguration.plugins,
      new StatsWriterPlugin({
        filename: STATS_FILE_NAME,
        stats: {
          ...DEV_STATS_OPTIONS,
          ...(verboseLogging ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
        },
        fields: [...DEV_STATS_FIELDS, ...(verboseLogging ? WEBPACK_DEBUG_STATS_FIELDS : [])],
      }) as any as WebpackPluginInstance,
      new webpack.container.ModuleFederationPlugin({
        name: 'host',
        shared: getSharedModules(config),
      }),
      new ModuleFederationIgnoreEntries({ entries: ['polyfill', 'modern.polyfill'] }),
      new ModuleFederationFixRange({
        flexibleTramvaiVersions: config.shared!.flexibleTramvaiVersions,
      }),
      showProgress && new WorkerProgressPlugin({ name: 'client', color: 'green' }),
      new PolyfillConditionPlugin({ filename: STATS_FILE_NAME }),
      new webpack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      new webpack.HotModuleReplacementPlugin(),
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
        'typeof window': JSON.stringify('object'),
        ...configToEnv({ config }),
        ...defineOptions.reduce((allOptions, options) => {
          return {
            ...allOptions,
            ...options,
          };
        }, {}),
      }),
      ...(integrity
        ? [
            new SubresourceIntegrityPlugin({
              enabled: 'auto',
              hashFuncNames: ['sha256'],
              hashLoading: 'eager',
              ...integrity,
            }),
            new AssetsIntegritiesPlugin({ fileName: STATS_FILE_NAME }),
          ]
        : []),
      ...(hotRefresh?.enabled
        ? [
            new ReactRefreshPlugin({
              ...hotRefresh.options,
              overlay:
                typeof hotRefresh.options?.overlay === 'boolean'
                  ? hotRefresh.options.overlay
                  : {
                      ...hotRefresh.options?.overlay,
                    },
            }),
          ]
        : []),
      config.dedupe.enabledDev &&
        new DedupePlugin({
          strategy: config.dedupe.strategy,
          ignorePackages: config.dedupe.ignore?.map((ignore) => new RegExp(`^${ignore}`)),
          showLogs: false,
        }),
      ...plugins.flat(),
      new PurifyStatsPlugin({ fileName: STATS_FILE_NAME, target: projectType }),
    ].filter(Boolean),
  };
};
