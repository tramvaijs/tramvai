/* eslint-disable max-statements */
import path from 'node:path';
import rspack, {
  WebpackPluginInstance,
  Compilation,
  Configuration,
  HotModuleReplacementPlugin,
} from '@rspack/core';
import { UniversalFederationPlugin } from '@module-federation/node';
import LoadablePlugin from '@loadable/webpack-plugin';
import { optional } from '@tinkoff/dippy';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
// eslint-disable-next-line import/extensions
import WebpackBar from 'webpackbar/rspack';

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
import { RSPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { RSPACK_PLUGINS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/plugins';
import { FancyReporter } from '@tramvai/plugin-base-builder/lib/plugins';
import { createChildAppSplitChunksOptions } from '@tramvai/plugin-base-builder/lib/shared/split-chunks';

import {
  clientBuildName,
  clientMainFields,
  stderrWithWarningFilters,
  transformMultiToken,
} from '@tramvai/plugin-base-builder/lib/shared/const';
import { createCacheConfig } from './shared/cache';
import { createTranspilerRules, resolveRspackTranspilerParameters } from './shared/transpiler';
import { getResolveTsConfig } from './shared/resolve';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';

import { RspackConfigurationFactory } from './types/rspack';
import { initDi } from '../utils/initDi';
import ChunkCorrelationPlugin from './plugins/ChunkCorrelationPlugin';

const IDENTIFIER_NAME_REPLACE_REGEX = /^([^a-zA-Z$_])/;
const IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX = /[^a-zA-Z0-9$]+/g;

// https://github.com/webpack/webpack/blob/da41ad1845947139375fb557107fa8bd2f6f8f27/lib/Template.js#L108
function toIdentifier(str: string) {
  return str
    .replace(IDENTIFIER_NAME_REPLACE_REGEX, '_$1')
    .replace(IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX, '_');
}

const PurifyStatsPlugin = getPurifyStatsPlugin(Compilation);

export const rspackConfig: RspackConfigurationFactory = async (config): Promise<Configuration> => {
  const di = await initDi(config, {
    type: 'child-app',
    target: 'client',
  });

  const {
    rootDir,
    sourceDir,
    projectType,
    projectName,
    projectVersion,
    showProgress,
    verboseLogging,
    hotRefresh,
    liveReload,
    noClientRebuild,
    clientSourceMap,
    port,
  } = config;

  const isHotEnabled = hotRefresh?.enabled && !noClientRebuild;

  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN))!;
  const plugins = di.get(optional(RSPACK_PLUGINS_TOKEN)) ?? [];
  const extensions = di.get(optional(RESOLVE_EXTENSIONS_TOKEN)) ?? defaultExtensions;
  const fallback = transformMultiToken(di.get(optional(RESOLVE_FALLBACK_TOKEN))) ?? {};
  const alias = transformMultiToken(di.get(optional(RESOLVE_ALIAS_TOKEN))) ?? {};
  const provideList = transformMultiToken(di.get(optional(PROVIDE_TOKEN))) ?? {};
  const additionalCacheFlags = di.get(optional(CACHE_ADDITIONAL_FLAGS_TOKEN)) ?? [];

  const rspackConfigExtension = config.extensions.webpack();
  Object.assign(fallback, rspackConfigExtension.resolveFallback);
  Object.assign(alias, rspackConfigExtension.resolveAlias);
  Object.assign(provideList, rspackConfigExtension.provide);

  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
  defineOptions.push(config.extensions.define());

  const transpilerParameters = resolveRspackTranspilerParameters({
    di,
    buildTarget: 'client',
  });
  const sourceMapsConfiguration = createSourceMaps<'rspack'>({ config, target: 'client' });
  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: true,
    sourceMap: clientSourceMap,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    buildTarget: 'client',
    extractCssPluginOptions: {
      filename: `[name]@${projectVersion}.css`,
      chunkFilename: `[name]@${projectVersion}.css`,
      ignoreOrder: true,
    },
  });

  const sharedModules = getSharedModules(config);
  const entry = resolveAbsolutePathForFile({
    file: 'index.ts',
    sourceDir,
    rootDir,
  });

  const statsFileName = `${projectName}_stats_loadable@${projectVersion}.json`;

  return {
    name: clientBuildName,
    // use empty module instead of original one as I haven't figured out how to prevent webpack from initializing entry module on loading
    // it should be initialized only as remote in ModuleFederation and not as standalone module
    entry: {
      [projectName]: {
        import: [
          path.resolve(__dirname, 'fakeModule.js?fallback'),
          ...[
            liveReload &&
              `${require.resolve('@rspack/dev-server/client/index')}?protocol=ws%3A&hostname=0.0.0.0&port=${port}&pathname=%2Fws&logging=warn&reconnect=10&hot=${isHotEnabled}&live-reload=${liveReload}`,
            isHotEnabled && require.resolve('@rspack/core/hot/dev-server'),
          ].filter(Boolean),
        ].filter((val): val is string => Boolean(val)),
      },
    },
    context: rootDir,
    target: 'web',
    mode: 'development',
    devtool: clientSourceMap ? sourceMapsConfiguration.devtool : rspackConfigExtension.devtool,
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
      ...getResolveTsConfig(config),
      symlinks: config.resolveSymlinks,
      fallback: {
        path: 'path-browserify',
        ...fallback,
      },
      alias,
    },
    module: {
      rules: [
        ...(clientSourceMap ? sourceMapsConfiguration.rules : []),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
        }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di, buildTarget: 'client' }),
      ],
    },
    optimization: {
      ...createChildAppSplitChunksOptions<'rspack'>({ config, target: 'client', sharedModules }),
    },
    stats: {
      // @ts-expect-error
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
      cache: createCacheConfig({
        config,
        additionalCacheFlags,
        transpilerParameters,
        target: clientBuildName,
      }),
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    snapshot: createSnapshot({ config }),
    plugins: [
      new ChunkCorrelationPlugin({
        filename: `${projectName}_stats@${projectVersion}.json`,
        shared: sharedModules,
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
      showProgress &&
        // @ts-expect-error
        new WebpackBar({ name: clientBuildName, color: 'green', reporters: [new FancyReporter()] }),
      new UniversalFederationPlugin(
        {
          name: projectName,
          // @ts-expect-error option used in ModuleFederationPluginV1, disable enhanced mf runtime
          enhanced: false,
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
        { ModuleFederationPlugin: rspack.container.ModuleFederationPluginV1 }
      ),
      ...(isHotEnabled
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
      new rspack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      isHotEnabled && new HotModuleReplacementPlugin(),
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
      ...stylesConfiguration.plugins,
      ...plugins.flat(),
    ].filter(Boolean),
  };
};
