/* eslint-disable max-statements */
import path from 'node:path';
import webpack, { WebpackPluginInstance, Compilation } from 'webpack';
import { ChunkCorrelationPlugin, UniversalFederationPlugin } from '@module-federation/node';
import LoadablePlugin from '@loadable/webpack-plugin';
import { optional } from '@tinkoff/dippy';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { getSharedModules } from '@tramvai/plugin-base-builder/lib/shared/shared-modules';
import { DEBUG_STATS_OPTIONS } from '@tramvai/plugin-base-builder/lib/shared/stats';
import { ignoreWarnings } from '@tramvai/plugin-base-builder/lib/utils';
import { CACHE_ADDITIONAL_FLAGS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/cache';
import {
  getPurifyStatsPlugin,
  PatchAutoPublicPathPlugin,
} from '@tramvai/plugin-base-builder/lib/plugins';
import { createSnapshot } from '@tramvai/plugin-base-builder/lib/shared/snapshot';
import {
  defaultExtensions,
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';
import { configToEnv } from '@tramvai/plugin-base-builder/lib/shared/config-to-env';
import { createSourceMaps } from '@tramvai/plugin-base-builder/lib/shared/sourcemaps';
import { WEBPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { WEBPACK_PLUGINS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/plugins';
import {
  clientBuildName,
  clientMainFields,
  stderrWithWarningFilters,
  transformMultiToken,
} from '@tramvai/plugin-base-builder/lib/shared/const';
import { createChildAppSplitChunksOptions } from '@tramvai/plugin-base-builder/lib/shared/split-chunks';

import { createCacheConfig } from './shared/cache';
import { createTranspilerRules, resolveWebpackTranspilerParameters } from './shared/transpiler';
import { createResolveOptions } from './shared/resolve';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';

import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { WebpackConfigurationFactory } from './types/webpack';

const IDENTIFIER_NAME_REPLACE_REGEX = /^([^a-zA-Z$_])/;
const IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX = /[^a-zA-Z0-9$]+/g;

// https://github.com/webpack/webpack/blob/da41ad1845947139375fb557107fa8bd2f6f8f27/lib/Template.js#L108
function toIdentifier(str: string) {
  return str
    .replace(IDENTIFIER_NAME_REPLACE_REGEX, '_$1')
    .replace(IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX, '_');
}

const PurifyStatsPlugin = getPurifyStatsPlugin(Compilation);

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
    hotRefresh,
    noClientRebuild,
    clientSourceMap,
  } = config;

  const isHotEnabled = hotRefresh?.enabled && !noClientRebuild;

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
  const sourceMapsConfiguration = createSourceMaps<'webpack'>({ config, target: 'client' });
  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: true,
    sourceMap: clientSourceMap,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    extractCssPluginOptions: {
      filename: `[name]@${projectVersion}.css`,
      chunkFilename: `[name]@${projectVersion}.css`,
      ignoreOrder: true,
      experimentalUseImportModule: true,
    },
  });

  const sharedModules = getSharedModules(config);
  const entry = resolveAbsolutePathForFile({
    file: 'index.ts',
    sourceDir,
    rootDir,
  });
  const resolveOptions = await createResolveOptions({ di, mainFields: clientMainFields });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  const statsFileName = `${projectName}_stats_loadable@${projectVersion}.json`;

  return {
    name: clientBuildName,
    // use empty module instead of original one as I haven't figured out how to prevent webpack from initializing entry module on loading
    // it should be initialized only as remote in ModuleFederation and not as standalone module
    entry: {
      [projectName]: {
        import: path.resolve(__dirname, 'fakeModule.js?fallback'),
      },
    },
    context: rootDir,
    target: 'web',
    mode: 'development',
    devtool: clientSourceMap ? sourceMapsConfiguration.devtool : webpackConfigExtension.devtool,
    cache: createCacheConfig({
      config,
      additionalCacheFlags,
      transpilerParameters,
      target: clientBuildName,
    }),
    output: {
      path: resolveAbsolutePathForFolder({
        folder: config.outputClient,
        rootDir,
      }),
      uniqueName: `${projectType}:${projectName}:${clientBuildName}:${projectVersion}`,
      publicPath: 'auto',
      library: projectName,
      filename: `[name]_client@${projectVersion}.js`,
      chunkFilename: '[name]_client.chunk.[contenthash].js',
      crossOriginLoading: 'anonymous',
      // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
      devtoolNamespace: '@tramvai/cli',
      // disable by default for better performance - https://webpack.js.org/guides/build-performance/#output-without-path-info
      pathinfo: Boolean(config.debugBuild),
    },
    resolve: {
      extensions,
      mainFields: clientMainFields,
      symlinks: config.resolveSymlinks,
      fallback: {
        path: 'path-browserify',
        ...fallback,
      },
      alias,
      plugins: [...resolveOptions.plugins],
    },
    module: {
      rules: [
        ...(clientSourceMap ? sourceMapsConfiguration.rules : []),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
          workerPoolConfig,
        }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di }),
      ],
    },
    optimization: {
      ...createChildAppSplitChunksOptions({ config, target: 'client', sharedModules }),
    },
    stats: {
      preset: 'errors-warnings',
      // disables the compilation success notification, the webpackbar already displays it
      warningsCount: false,
      ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
    },
    infrastructureLogging: {
      level: 'warn',
      ...(verboseLogging ? { level: 'verbose', debug: true } : {}),
      ...(verboseLogging ? {} : { stream: stderrWithWarningFilters }),
    },
    experiments: {
      futureDefaults: true,
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    snapshot: createSnapshot({ config }),
    plugins: [
      new ChunkCorrelationPlugin({
        filename: `${projectName}_stats@${projectVersion}.json`,
      }),
      new LoadablePlugin({
        filename: statsFileName,
        outputAsset: true,
        // @ts-expect-error wrong typings
        // to prevent webpack modules with same id collision, because Child Apps builds are independent of each other
        chunkLoadingGlobal: toIdentifier(
          `__LOADABLE_LOADED_CHUNKS__child_app_${projectName}_${projectVersion}__`
        ),
      }) as unknown as WebpackPluginInstance,
      new PatchAutoPublicPathPlugin(),
      new PurifyStatsPlugin({ fileName: statsFileName, target: 'child-app' }),
      showProgress && new WorkerProgressPlugin({ name: clientBuildName, color: 'green' }),
      new UniversalFederationPlugin(
        {
          isServer: false,
          name: projectName,
          library: {
            name: 'window["child-app__" + (document.currentScript.src || document.currentScript.dataset.src)]',
            type: 'assign',
          },
          exposes: {
            // path.relative should use the posix separator because
            // @module-federation/node is parsing relative path incorrectly
            // Debug notes: there is problem in webpack/ModuleFederation or enhanced-resolve
            entry: entry.split(path.win32.sep).join(path.posix.sep),
          },
          shared: sharedModules,
        },
        {}
      ),
      ...(isHotEnabled
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
      new webpack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
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
      ...stylesConfiguration.plugins,
      ...plugins.flat(),
    ].filter(Boolean),
  };
};
