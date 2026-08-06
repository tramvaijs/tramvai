/* eslint-disable max-statements */
import path from 'node:path';
import { UniversalFederationPlugin } from '@module-federation/node';
import { optional } from '@tinkoff/dippy';
import webpack from 'webpack';

import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { getSharedModules } from '@tramvai/plugin-base-builder/lib/shared/shared-modules';
import { DEBUG_STATS_OPTIONS } from '@tramvai/plugin-base-builder/lib/shared/stats';
import { ignoreWarnings } from '@tramvai/plugin-base-builder/lib/utils';
import { CACHE_ADDITIONAL_FLAGS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/cache';
import { createSnapshot } from '@tramvai/plugin-base-builder/lib/shared/snapshot';
import {
  defaultExtensions,
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';
import { createSourceMaps } from '@tramvai/plugin-base-builder/lib/shared/sourcemaps';
import { WEBPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import { configToEnv } from '@tramvai/plugin-base-builder/lib/shared/config-to-env';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { WEBPACK_PLUGINS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/plugins';
import { RuntimePathPlugin } from '@tramvai/plugin-base-builder/lib/plugins';

import { WebpackConfigurationFactory } from './types/webpack';
import {
  serverBuildName,
  serverMainFields,
  stderrWithWarningFilters,
  transformMultiToken,
} from './shared/const';
import { createChildAppSplitChunksOptions } from './shared/split-chunks';
import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { createCacheConfig } from './shared/cache';
import { createTranspilerRules, resolveWebpackTranspilerParameters } from './shared/transpiler';
import { createResolveOptions } from './shared/resolve';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';

export const webpackConfig: WebpackConfigurationFactory = async ({ di }) => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const {
    rootDir,
    sourceDir,
    projectType,
    projectName,
    projectVersion,
    showProgress,
    verboseLogging,
    noServerRebuild,
    hotRefresh,
    serverSourceMap,
  } = config;

  const isHotEnabled = hotRefresh?.enabled && !noServerRebuild;

  const transpiler = di.get(optional(WEBPACK_TRANSPILER_TOKEN))!;
  const plugins = di.get(optional(WEBPACK_PLUGINS_TOKEN)) ?? [];
  const extensions = di.get(optional(RESOLVE_EXTENSIONS_TOKEN)) ?? defaultExtensions;
  const fallback = transformMultiToken(di.get(optional(RESOLVE_FALLBACK_TOKEN))) ?? {};
  const alias = transformMultiToken(di.get(optional(RESOLVE_ALIAS_TOKEN))) ?? {};
  const provideList = transformMultiToken(di.get(optional(PROVIDE_TOKEN))) ?? {};
  const additionalCacheFlags = di.get(optional(CACHE_ADDITIONAL_FLAGS_TOKEN)) ?? [];

  const webpackConfigExtension = config.extensions.webpack();
  Object.assign(fallback, webpackConfigExtension.resolveFallback);
  Object.assign(alias, webpackConfigExtension.resolveAlias);
  Object.assign(provideList, webpackConfigExtension.provide);

  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
  defineOptions.push(config.extensions.define());

  const transpilerParameters = resolveWebpackTranspilerParameters({
    di,
    hot: Boolean(isHotEnabled),
  });
  const workerPoolConfig = createWorkerPoolConfig({ di });
  const sourceMapsConfiguration = createSourceMaps<'webpack'>({ config, target: 'server' });
  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: false,
    sourceMap: serverSourceMap,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    extractCssPluginOptions: {
      filename: `[name]@${projectVersion}.css`,
      chunkFilename: `[name]@${projectVersion}.css`,
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const sharedModules = getSharedModules(config);
  const entry = resolveAbsolutePathForFile({
    file: 'index.ts',
    sourceDir,
    rootDir,
  });
  const resolveOptions = await createResolveOptions({ di, mainFields: serverMainFields });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  return {
    name: serverBuildName,
    context: rootDir,
    // settings false is required by the UniversalModuleFederationPlugin
    // https://github.com/module-federation/universe/blob/02221527aa684d2a37773c913bf341748fd34ecf/packages/node/src/plugins/StreamingTargetPlugin.ts#L24
    target: false,
    // use empty module instead of original one as I haven't figured out how to prevent webpack from initializing entry module on loading
    // it should be initialized only as remote in ModuleFederation and not as standalone module
    entry: {
      [projectName]: {
        import: path.resolve(__dirname, 'fakeModule.js?fallback'),
      },
    },
    mode: 'development',
    devtool: serverSourceMap ? sourceMapsConfiguration.devtool : webpackConfigExtension.devtool,
    cache: createCacheConfig({
      config,
      additionalCacheFlags,
      transpilerParameters,
      target: serverBuildName,
    }),
    output: {
      path: resolveAbsolutePathForFolder({
        folder: config.outputServer,
        rootDir,
      }),
      uniqueName: `${projectType}:${projectName}:${serverBuildName}:${projectVersion}`,
      publicPath: '',
      filename: `[name]_server@${projectVersion}.js`,
      chunkFilename: '[name]_server.chunk.[contenthash].js',
      // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
      devtoolNamespace: '@tramvai/cli',
      // disable by default for better performance - https://webpack.js.org/guides/build-performance/#output-without-path-info
      pathinfo: Boolean(config.debugBuild),
    },
    resolve: {
      extensions,
      mainFields: serverMainFields,
      symlinks: config.resolveSymlinks,
      fallback,
      alias,
      plugins: [...resolveOptions.plugins],
    },
    module: {
      rules: [
        ...(serverSourceMap ? sourceMapsConfiguration.rules : []),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
          workerPoolConfig,
        }),
        {
          resourceQuery: /fallback/,
          options: { name: projectName },
          loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/childAppFallback'),
        },
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di }),
      ],
    },
    optimization: {
      ...createChildAppSplitChunksOptions({ config, target: 'server', sharedModules }),
    },
    experiments: {
      futureDefaults: true,
    },
    stats: {
      preset: 'errors-warnings',
      // disables the compilation success notification, the webpackbar already displays it
      warningsCount: false,
      ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
    },
    // TODO: check is it configuration optimal?
    infrastructureLogging: {
      level: 'warn',
      ...(verboseLogging ? { level: 'verbose', debug: true } : {}),
      ...(verboseLogging ? {} : { stream: stderrWithWarningFilters }),
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    snapshot: createSnapshot({ config }),
    plugins: [
      showProgress && new WorkerProgressPlugin({ name: serverBuildName, color: 'orange' }),
      // @ts-expect-error
      new UniversalFederationPlugin({
        isServer: true,
        name: projectName,
        library: {
          type: 'commonjs2',
        },
        exposes: {
          // path.relative should use the posix separator because
          // @module-federation/node is parsing relative path incorrectly
          // Debug notes: there is problem in webpack/ModuleFederation or enhanced-resolve
          entry: entry.split(path.win32.sep).join(path.posix.sep),
        },
        shared: sharedModules,
      }),
      new webpack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      new RuntimePathPlugin({
        publicPath: 'ASSETS_PREFIX',
      }),
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
        'typeof window': JSON.stringify('undefined'),
        ...configToEnv({ config }),
        ...defineOptions.reduce((allOptions, options) => {
          return {
            ...allOptions,
            ...options,
          };
        }, {}),
      }),
      ...stylesConfiguration.plugins,
      ...plugins.flat(),
    ],
  };
};
