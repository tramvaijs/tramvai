/* eslint-disable max-statements */
import path from 'node:path';
import { NodeFederationPlugin } from '@module-federation/node';
import { optional } from '@tinkoff/dippy';
import rspack, { Configuration } from '@rspack/core';
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
import { createSnapshot } from '@tramvai/plugin-base-builder/lib/shared/snapshot';
import {
  defaultExtensions,
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';
import { createSourceMaps } from '@tramvai/plugin-base-builder/lib/shared/sourcemaps';
import { RSPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import { configToEnv } from '@tramvai/plugin-base-builder/lib/shared/config-to-env';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { RSPACK_PLUGINS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/plugins';
import { RuntimePathPlugin } from '@tramvai/plugin-base-builder/lib/plugins';
import {
  serverBuildName,
  serverMainFields,
  stderrWithWarningFilters,
  transformMultiToken,
} from '@tramvai/plugin-base-builder/lib/shared/const';
import { FancyReporter } from '@tramvai/plugin-base-builder/lib/plugins';
import { createChildAppSplitChunksOptions } from '@tramvai/plugin-base-builder/lib/shared/split-chunks';

import { RspackConfigurationFactory } from './types/rspack';
import { createCacheConfig } from './shared/cache';
import { createTranspilerRules, resolveRspackTranspilerParameters } from './shared/transpiler';
import { getResolveTsConfig } from './shared/resolve';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';
import { initDi } from '../utils/initDi';

export const rspackConfig: RspackConfigurationFactory = async (config): Promise<Configuration> => {
  const di = await initDi(config, {
    type: 'child-app',
    target: 'server',
  });

  const {
    rootDir,
    sourceDir,
    projectType,
    projectName,
    projectVersion,
    showProgress,
    verboseLogging,
    serverSourceMap,
  } = config;

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
    buildTarget: 'server',
  });
  const sourceMapsConfiguration = createSourceMaps<'rspack'>({ config, target: 'server' });
  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);

  const stylesConfiguration = createStylesConfiguration({
    di,
    emitCssChunks: true,
    sourceMap: serverSourceMap,
    browserslistConfig: normalizedBrowserslistConfig.defaults,
    buildTarget: 'server',
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

  return {
    name: serverBuildName,
    context: rootDir,
    // settings false is required by the UniversalModuleFederationPlugin
    // https://github.com/module-federation/universe/blob/02221527aa684d2a37773c913bf341748fd34ecf/packages/node/src/plugins/StreamingTargetPlugin.ts#L24
    target: 'node',
    // use empty module instead of original one as I haven't figured out how to prevent webpack from initializing entry module on loading
    // it should be initialized only as remote in ModuleFederation and not as standalone module
    entry: {
      [projectName]: {
        import: path.resolve(__dirname, 'fakeModule.js?fallback'),
      },
    },
    mode: 'development',
    devtool: serverSourceMap ? sourceMapsConfiguration.devtool : rspackConfigExtension.devtool,
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
      ...getResolveTsConfig(config),
      alias,
    },
    module: {
      rules: [
        ...(serverSourceMap ? sourceMapsConfiguration.rules : []),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
        }),
        {
          resourceQuery: /fallback/,
          options: { name: projectName },
          loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/childAppFallback'),
        },
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di, buildTarget: 'server' }),
      ],
    },
    optimization: {
      ...createChildAppSplitChunksOptions<'rspack'>({ config, target: 'server', sharedModules }),
    },
    experiments: {
      futureDefaults: true,
      cache: createCacheConfig({
        config,
        additionalCacheFlags,
        transpilerParameters,
        target: serverBuildName,
      }),
    },
    stats: {
      // @ts-expect-error
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
      showProgress &&
        new WebpackBar({
          name: serverBuildName,
          color: 'orange',
          // @ts-expect-error
          reporters: [new FancyReporter()],
        }),
      new NodeFederationPlugin(
        {
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
        },
        {}
      ),
      new rspack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      new RuntimePathPlugin({
        publicPath: 'ASSETS_PREFIX',
      }),
      new rspack.DefinePlugin({
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
    ].filter(Boolean),
  };
};
