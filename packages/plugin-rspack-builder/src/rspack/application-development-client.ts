/* eslint-disable max-statements */
/* eslint-disable complexity */
import { Writable } from 'node:stream';

import { Compilation } from '@rspack/core';
import rspack, { Configuration as RspackConfiguration } from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { optional } from '@tinkoff/dippy';
// eslint-disable-next-line import/extensions
import WebpackBar from 'webpackbar/rspack';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { SubresourceIntegrityPlugin } from '@rspack/core';
import flatten from '@tinkoff/utils/array/flatten';
import { DedupePlugin } from '@tinkoff/webpack-dedupe-plugin';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';

import {
  ignoreWarnings,
  resolvePublicPathDirectory,
  resolveUrl,
} from '@tramvai/plugin-base-builder/lib/utils';
import {
  getAnalyzeRsdoctorOptions,
  getBenchmarkRsdoctorOptions,
} from '@tramvai/plugin-base-builder/lib/shared/rsdoctor';
import {
  DEBUG_STATS_OPTIONS,
  DEBUG_STATS_FIELDS,
  DEV_STATS_OPTIONS,
  DEV_STATS_FIELDS,
  STATS_FILE_NAME,
  POLYFILLS_STATS_FILE_NAME,
} from '@tramvai/plugin-base-builder/lib/shared/stats';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { configToEnv } from '@tramvai/plugin-base-builder/lib/shared/config-to-env';
import { createOptimizeOptions } from '@tramvai/plugin-base-builder/lib/shared/optimization';
import { getSharedModules } from '@tramvai/plugin-base-builder/lib/shared/shared-modules';
import { createSnapshot } from '@tramvai/plugin-base-builder/lib/shared/snapshot';
import {
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
  defaultExtensions,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';
import { BUILD_EXTERNALS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/externals';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import { createSourceMaps } from '@tramvai/plugin-base-builder/lib/shared/sourcemaps';
import {
  AssetsIntegritiesPlugin,
  FancyReporter,
  PolyfillConditionPlugin,
  RuntimePathPlugin,
  getPurifyStatsPlugin,
  getCollectStatsPlugin,
  getMergeStatsPlugin,
} from '@tramvai/plugin-base-builder/lib/plugins';
import { RSPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { RSPACK_PLUGINS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/plugins';

import { createTranspilerRules, resolveRspackTranspilerParameters } from './shared/transpiler';
import { createSplitChunksOptions } from './shared/split-chunks';
import { getResolveTsConfig } from './shared/resolve';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';
import { CACHE_ADDITIONAL_FLAGS_TOKEN, createCacheConfig } from './shared/cache';

import { RspackConfigurationFactory } from './types/rspack';
import { initDi } from '../utils/initDi';

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

const PurifyStatsPlugin = getPurifyStatsPlugin(Compilation);
const CollectStatsPlugin = getCollectStatsPlugin(Compilation);
const MergeStatsPlugin = getMergeStatsPlugin(Compilation);

export const clientBuildName = 'client';
export const polyfillBuildName = 'polyfill';

export const rspackConfig: RspackConfigurationFactory = async (config) => {
  const di = await initDi(config, {
    type: 'application',
    target: 'client',
  });

  const {
    polyfill,
    modernPolyfill,
    sourceDir,
    rootDir,
    showProgress,
    hotRefresh,
    integrity,
    verboseLogging,
    projectType,
  } = config;

  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN))!;
  const externals = di.get(optional(BUILD_EXTERNALS_TOKEN)) ?? ([] as string[]);
  const plugins = di.get(optional(RSPACK_PLUGINS_TOKEN)) ?? [];
  const extensions = di.get(optional(RESOLVE_EXTENSIONS_TOKEN)) ?? defaultExtensions;
  const fallback = di.get(optional(RESOLVE_FALLBACK_TOKEN)) ?? {};
  const provideList = di.get(optional(PROVIDE_TOKEN)) ?? {};
  const additionalCacheFlags = di.get(optional(CACHE_ADDITIONAL_FLAGS_TOKEN)) ?? [];
  const rspackConfigExtension = config.extensions.webpack();

  let alias = di.get(optional(RESOLVE_ALIAS_TOKEN)) ?? {};
  if (Array.isArray(alias)) {
    alias = alias.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  Object.assign(fallback, rspackConfigExtension.resolveFallback);
  Object.assign(alias, rspackConfigExtension.resolveAlias);
  Object.assign(provideList, rspackConfigExtension.provide);

  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
  defineOptions.push(config.extensions.define());

  const transpilerParameters = resolveRspackTranspilerParameters({ di, buildTarget: 'client' });

  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);
  const browserslistConfig = JSON.stringify(normalizedBrowserslistConfig);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: true,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    buildTarget: 'client',
    extractCssPluginOptions: {
      filename: '[name].css',
      chunkFilename: '[name].chunk.css',
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const polyfillPath = safeRequireResolve(
    resolveAbsolutePathForFile({
      file: polyfill ?? 'polyfill',
      sourceDir,
      rootDir,
    }),
    typeof polyfill === 'undefined'
  );
  const modernPolyfillPath = safeRequireResolve(
    resolveAbsolutePathForFile({
      file: modernPolyfill ?? 'modern.polyfill',
      sourceDir,
      rootDir,
    }),
    typeof modernPolyfill === 'undefined'
  );

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';
  const virtualRootErrorBoundary = require.resolve('@tramvai/api/lib/virtual/root-error-boundary');

  const sourceMapsConfiguration = createSourceMaps<'rspack'>({ config, target: 'client' });

  const isPolyfillsExists = Boolean(polyfillPath || modernPolyfillPath);

  const buildRspackConfig: RspackConfiguration = {
    // https://webpack.js.org/configuration/target/#browserslist
    target: normalizedBrowserslistConfig.defaults
      ? // unknown support for UCAndroid browser lead to false checks for some ES features
        // https://github.com/webpack/webpack/blob/914db1f7ca1ff6ed4eba015b6765add9afac35e3/lib/config/browserslistTargetHandler.js#L212
        `browserslist:${normalizedBrowserslistConfig.defaults.filter((query) => !query.includes('UCAndroid'))}`
      : 'web',
    context: rootDir,
    cache: true,
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
      // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
      devtoolNamespace: '@tramvai/cli',
      // disable by default for better performance - https://webpack.js.org/guides/build-performance/#output-without-path-info
      pathinfo: Boolean(config.debugBuild),
    },
    mode: 'development',
    devtool: config.sourceMap ? sourceMapsConfiguration.devtool : rspackConfigExtension.devtool,
    // TODO: check is it configuration optimal?
    stats: {
      // TODO: missmatch types with webpack
      // @ts-expect-error
      preset: 'errors-warnings',
      // disables the compilation success notification, the webpackbar already displays it
      warningsCount: false,
      ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
    },
    node: {
      // "warn" with `futureDefaults`
      global: true,
    },
    watchOptions: config.noClientRebuild
      ? {
          ignored: /.*/,
        }
      : (rspackConfigExtension.watchOptions ?? {
          aggregateTimeout: 20,
          ignored: config.debugBuild ? ['**/.git/**'] : ['**/node_modules/**', '**/.git/**'],
        }),
    resolve: {
      extensions,
      // TODO: es2017, es2016, es2015 fields support?
      mainFields,
      ...getResolveTsConfig(config),
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
    },
    snapshot: createSnapshot({ config }),
    externals: [
      ...flatten<RegExp>(externals),
      ...(Array.isArray(rspackConfigExtension.externals)
        ? rspackConfigExtension.externals
        : (rspackConfigExtension.externals?.development ?? [])),
    ].map((s) => new RegExp(`^${s}`)),
    // TODO: check is it configuration optimal?
    infrastructureLogging: {
      level: 'warn',
      ...(verboseLogging ? { level: 'verbose', debug: true } : {}),
      ...(verboseLogging ? {} : { stream: stderrWithWarningFilters }),
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    plugins: [
      new rspack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      new rspack.DefinePlugin({
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
    ],
  };

  const clientBuildRspackConfig: RspackConfiguration = {
    ...buildRspackConfig,
    name: clientBuildName,
    dependencies: isPolyfillsExists ? [polyfillBuildName] : [],
    entry: {
      // TODO: more missed files watchers with absolute path?
      platform: {
        import: resolveAbsolutePathForFile({
          file: config.entryFile,
          sourceDir: config.sourceDir,
          rootDir: config.rootDir,
        }),
      },
      ...(isRootErrorBoundaryEnabled ? { rootErrorBoundary: virtualRootErrorBoundary } : {}),
    },
    output: {
      ...buildRspackConfig.output,
      // uniqueName are used for various webpack internals
      // currently, we use that value in the ModuleFederation glue code
      uniqueName: `${projectType}:${config.projectName}:${clientBuildName}:${config.projectVersion}`,
    },
    optimization: {
      // TODO: in rspack@1 breaks hot-reload
      // fixed in rspack@2
      // emitOnErrors: false,
      ...createSplitChunksOptions({ config }),
      ...createOptimizeOptions<'rspack'>({ config, target: 'client' }),
    },
    experiments: {
      futureDefaults: true,
      cache: createCacheConfig({
        config,
        additionalCacheFlags,
        transpilerParameters,
        target: clientBuildName,
      }),
    },
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
        }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di, buildTarget: 'client' }),
        ...(isRootErrorBoundaryEnabled
          ? [
              {
                test: new RegExp(virtualRootErrorBoundary),
                loader: require.resolve(
                  '@tramvai/plugin-base-builder/lib/loaders/root-error-boundary'
                ),
                enforce: 'pre' as const,
                options: {
                  path: config.fileSystemPages!.rootErrorBoundaryPath,
                },
              },
            ]
          : []),
        {
          // test: /[\\/]cli[\\/]lib[\\/]external[\\/]pages.js$/,
          test: /[\\/]api[\\/]lib[\\/]virtual[\\/]file-system-pages.js$/,
          loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/file-system-pages'),
          enforce: 'pre',
          options: {
            fileSystemPages: config.fileSystemPages!,
            rootDir: config.rootDir,
            sourceDir: config.sourceDir,
            extensions,
          },
        },
        ...(config.sourceMap ? sourceMapsConfiguration.rules : []),
      ],
    },
    plugins: [
      ...buildRspackConfig.plugins!,
      new rspack.experiments.VirtualModulesPlugin({
        '/node_modules/virtual:tramvai/browserslist.js': `export default ${browserslistConfig}`,
      }),
      new StatsWriterPlugin({
        filename: STATS_FILE_NAME,
        stats: {
          ...DEV_STATS_OPTIONS,
          ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
        },
        fields: [...DEV_STATS_FIELDS, ...(verboseLogging ? DEBUG_STATS_FIELDS : [])],
      }) as any,
      showProgress &&
        // @ts-expect-error
        new WebpackBar({ name: clientBuildName, color: 'green', reporters: [new FancyReporter()] }),
      new PurifyStatsPlugin({ fileName: STATS_FILE_NAME, target: projectType }),
      ...(integrity
        ? [
            new SubresourceIntegrityPlugin({
              enabled: 'auto',
              hashFuncNames: ['sha256'],
              // not supported in rspack
              // hashLoading: 'eager',
              ...integrity,
            }),
            new AssetsIntegritiesPlugin({ fileName: STATS_FILE_NAME }),
          ]
        : []),
      isPolyfillsExists &&
        new MergeStatsPlugin({
          currentStatsName: STATS_FILE_NAME,
          statsNames: [polyfillBuildName],
        }),
      config.benchmark &&
        // require `@rsdoctor/rspack-plugin` here to speed up webpack worker initialization when benchmarking is not used
        new (require('@rsdoctor/rspack-plugin').RsdoctorRspackMultiplePlugin)(
          getBenchmarkRsdoctorOptions('client')
        ),
      config.analyze &&
        // require `@rsdoctor/rspack-plugin` here to speed up webpack worker initialization when analyze is not used
        new (require('@rsdoctor/rspack-plugin').RsdoctorRspackMultiplePlugin)(
          getAnalyzeRsdoctorOptions()
        ),
      new rspack.container.ModuleFederationPluginV1({
        name: 'host',
        shared: getSharedModules(config),
      }),
      // window.ap is set in packages/modules/render/src/server/blocks/bundleResource/bundleResource.ts
      // in the development build, window.ap is assigned only if there is a valid ASSETS_PREFIX
      // so we change publicPath to window.ap only under the same condition
      process.env.ASSETS_PREFIX &&
        process.env.ASSETS_PREFIX !== 'static' &&
        new RuntimePathPlugin({
          publicPath: 'window.ap',
        }),
      ...(hotRefresh?.enabled
        ? [
            new ReactRefreshPlugin({
              ...hotRefresh.options,
              // @ts-expect-error
              // Types of webpack react refresh and Rspack react refresh differs
              overlay:
                typeof hotRefresh.options?.overlay === 'boolean'
                  ? hotRefresh.options.overlay
                  : {
                      ...hotRefresh.options?.overlay,
                    },
            }),
          ]
        : []),
      ...stylesConfiguration.plugins,
      config.dedupe.enabledDev &&
        new DedupePlugin({
          strategy: config.dedupe.strategy,
          ignorePackages: config.dedupe.ignore?.map((ignore: string) => new RegExp(`^${ignore}`)),
          showLogs: false,
        }),
      ...plugins.flat(),
    ].filter(Boolean),
  };

  const polyfillBuildRspackConfig: RspackConfiguration = {
    ...buildRspackConfig,
    name: polyfillBuildName,
    entry: {
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
    },
    output: {
      ...buildRspackConfig.output,
      // uniqueName are used for various webpack internals
      // currently, we use that value in the ModuleFederation glue code
      uniqueName: `${projectType}:${config.projectName}:${polyfillBuildName}:${config.projectVersion}`,
    },
    optimization: {
      // TODO: in rspack@1 breaks hot-reload
      // fixed in rspack@2
      // emitOnErrors: false,
    },
    experiments: {
      futureDefaults: true,
      cache: createCacheConfig({
        config,
        additionalCacheFlags,
        transpilerParameters,
        target: polyfillBuildName,
      }),
    },
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
        }),
        ...(config.sourceMap ? sourceMapsConfiguration.rules : []),
      ],
    },
    plugins: [
      ...buildRspackConfig.plugins!,
      new StatsWriterPlugin({
        filename: POLYFILLS_STATS_FILE_NAME,
        stats: {
          ...DEV_STATS_OPTIONS,
          ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
        },
        fields: [...DEV_STATS_FIELDS, ...(verboseLogging ? DEBUG_STATS_FIELDS : [])],
      }) as any,
      new CollectStatsPlugin({ filename: POLYFILLS_STATS_FILE_NAME }),
      new PurifyStatsPlugin({ fileName: POLYFILLS_STATS_FILE_NAME, target: projectType }),
      ...(integrity
        ? [
            new SubresourceIntegrityPlugin({
              enabled: 'auto',
              hashFuncNames: ['sha256'],
              // not supported in rspack
              // hashLoading: 'eager',
              ...integrity,
            }),
            new AssetsIntegritiesPlugin({ fileName: POLYFILLS_STATS_FILE_NAME }),
          ]
        : []),
      new PolyfillConditionPlugin({ filename: POLYFILLS_STATS_FILE_NAME }),
      ...plugins.flat(),
    ].filter(Boolean),
  };

  return [clientBuildRspackConfig].concat(isPolyfillsExists ? polyfillBuildRspackConfig : []);
};
