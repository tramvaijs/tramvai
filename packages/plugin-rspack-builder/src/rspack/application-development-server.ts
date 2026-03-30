/* eslint-disable complexity */
/* eslint-disable max-statements */
import { Writable } from 'node:stream';

import rspack, { Configuration } from '@rspack/core';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { optional } from '@tinkoff/dippy';
import flatten from '@tinkoff/utils/array/flatten';
// eslint-disable-next-line import/extensions
import WebpackBar from 'webpackbar/rspack';
import { DedupePlugin } from '@tinkoff/webpack-dedupe-plugin';
import { FancyReporter, RuntimePathPlugin } from '@tramvai/plugin-base-builder/lib/plugins';
import {
  ignoreWarnings,
  resolvePublicPathDirectory,
  resolveUrl,
  getApplicationUrl,
} from '@tramvai/plugin-base-builder/lib/utils';
import {
  getAnalyzeRsdoctorOptions,
  getBenchmarkRsdoctorOptions,
} from '@tramvai/plugin-base-builder/lib/shared/rsdoctor';
import { DEBUG_STATS_OPTIONS } from '@tramvai/plugin-base-builder/lib/shared/stats';
import { normalizeBrowserslistConfig } from '@tramvai/plugin-base-builder/lib/shared/browserslist';
import { configToEnv } from '@tramvai/plugin-base-builder/lib/shared/config-to-env';
import { BUILD_EXTERNALS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/externals';
import { createOptimizeOptions } from '@tramvai/plugin-base-builder/lib/shared/optimization';
import { getSharedModules } from '@tramvai/plugin-base-builder/lib/shared/shared-modules';
import { createSnapshot } from '@tramvai/plugin-base-builder/lib/shared/snapshot';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { createSourceMaps } from '@tramvai/plugin-base-builder/lib/shared/sourcemaps';
import { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
import {
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
  defaultExtensions,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';

import {
  RSPACK_TRANSPILER_TOKEN,
  createTranspilerRules,
  resolveRspackTranspilerParameters,
} from './shared/transpiler';
import { getResolveTsConfig } from './shared/resolve';
import { createServerInlineRules } from './shared/server-inline';
import { createAssetsRules } from './shared/assets';
import { createStylesConfiguration } from './shared/styles';
import { RSPACK_PLUGINS_TOKEN } from './shared/plugins';
import { CACHE_ADDITIONAL_FLAGS_TOKEN, createCacheConfig } from './shared/cache';

import { RspackConfigurationFactory } from './rspack-config';
import { initDi } from '../utils/initDi';

const mainFields = ['module', 'main'];

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

export const rspackConfig: RspackConfigurationFactory = async (
  inputParameters,
  extraConfiguration
): Promise<Configuration> => {
  const di = await initDi(inputParameters, extraConfiguration, {
    type: 'application',
    target: 'server',
  });
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const { verboseLogging, rootDir } = config;

  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN))!;
  const defineOptions = di.get(optional(DEFINE_PLUGIN_OPTIONS_TOKEN)) ?? [];
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

  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);
  const browserslistConfig = JSON.stringify(normalizedBrowserslistConfig);

  const stylesConfiguration = createStylesConfiguration({
    di,
    // we don't need the css on server, but it's needed to generate proper classnames in js
    emitCssChunks: false,
    browserslistConfig: normalizedBrowserslistConfig.node,
    buildTarget: 'server',
    extractCssPluginOptions: {
      filename: 'server.css',
      ignoreOrder: true,
      // TODO useImportModule
      // experimentalUseImportModule: !!configManager.experiments.minicss?.useImportModule,
    },
  });

  const transpilerParameters = resolveRspackTranspilerParameters({ di, buildTarget: 'server' });

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';

  const virtualTramvaiConfig = `const appConfig = ${JSON.stringify(config.dehydrate())};
export { appConfig };
export default appConfig;`;

  const sourceMapsConfiguration = createSourceMaps<'rspack'>({ config, target: 'server' });

  return {
    name: 'server',
    target: normalizedBrowserslistConfig.node
      ? `browserslist:${normalizedBrowserslistConfig.node}`
      : 'node',
    context: rootDir,
    entry: {
      server: resolveAbsolutePathForFile({
        file: config.entryFile,
        sourceDir: config.sourceDir,
        rootDir,
      }),
    },
    devtool: config.sourceMap ? sourceMapsConfiguration.devtool : rspackConfigExtension.devtool,
    node: {
      // TODO https://github.com/tramvaijs/tramvai/-/commit/c3f3db838fd711ee7a53a84f5bd832cdeebc293a
      // __dirname: false
      // "warn" with `futureDefaults`
      global: true,
    },
    cache: true,
    output: {
      path: resolveAbsolutePathForFolder({ folder: config.outputServer, rootDir: config.rootDir }),
      publicPath: `${resolveUrl({
        host: config.staticHost,
        port: config.staticPort,
        protocol: config.httpProtocol,
      })}${resolvePublicPathDirectory(config.outputServer)}`,
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
    // TODO: research why this list?
    externals: [
      'react$',
      'react-dom',
      'prop-types',
      'fastify',
      'core-js',
      ...flatten<RegExp>(externals),
      ...(Array.isArray(rspackConfigExtension.externals)
        ? rspackConfigExtension.externals
        : (rspackConfigExtension.externals?.development ?? [])),
    ].map((s) => new RegExp(`^${s}`)),
    resolve: {
      // support for https://nodejs.org/api/addons.html
      extensions: [...extensions, '.node'],
      mainFields,
      symlinks: config.resolveSymlinks,
      fallback,
      ...getResolveTsConfig(config),
      alias: {
        // backward compatibility for old @tramvai/cli file-system pages mechanism
        '@tramvai/cli/lib/external/pages': '@tramvai/api/lib/virtual/file-system-pages',
        // backward compatibility for old @tramvai/cli file-system papi mechanism
        '@tramvai/cli/lib/external/api': '@tramvai/api/lib/virtual/file-system-papi',
        // backward compatibility for old @tramvai/cli config mechanism
        '@tramvai/cli/lib/external/config': 'virtual:tramvai/config',
        // backward compatibility for old @tramvai/cli normalized browserslist mechanism
        '@tramvai/cli/lib/external/browserslist-normalized-file-config':
          'virtual:tramvai/browserslist',
        ...(isRootErrorBoundaryEnabled
          ? { '@/__private__/error': config.fileSystemPages!.rootErrorBoundaryPath }
          : {}),
        ...alias,
      },
    },
    module: {
      parser: {
        javascript: {
          // "error" with `futureDefaults`
          exportsPresence: 'warn',
        },
      },
      rules: [
        // *.inline files rules should be before the transpiler rules
        ...createServerInlineRules({ di }),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
        }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di, buildTarget: 'server' }),
        {
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
        {
          test: /[\\/]api[\\/]lib[\\/]virtual[\\/]file-system-papi.js$/,
          loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/file-system-papi'),
          enforce: 'pre',
          options: {
            fileSystemPapiDir: config.fileSystemPapiDir!,
            rootDir: config.rootDir,
            sourceDir: config.sourceDir,
            extensions,
          },
        },
        ...(config.sourceMap ? sourceMapsConfiguration.rules : []),
      ],
    },
    watchOptions: config.noServerRebuild
      ? {
          ignored: /.*/,
        }
      : (rspackConfigExtension.watchOptions ?? {
          aggregateTimeout: 20,
          ignored: config.inspectBuildProcess
            ? ['**/.git/**']
            : ['**/node_modules/**', '**/.git/**'],
        }),
    optimization: {
      emitOnErrors: false,
      ...createOptimizeOptions<'rspack'>({ config, target: 'server' }),
    },
    stats: {
      // @ts-expect-error
      preset: 'errors-warnings',
      ...(verboseLogging ? DEBUG_STATS_OPTIONS : {}),
    },
    ignoreWarnings: verboseLogging ? [] : ignoreWarnings,
    // TODO: check is it configuration optimal?
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
        target: 'server',
      }),
    },
    snapshot: createSnapshot({ config }),
    plugins: [
      ...stylesConfiguration.plugins,
      new rspack.experiments.VirtualModulesPlugin({
        // TCORE-5228 FIXME: when `@tramvai/cli/lib/external/config` import is used, it will resolve to `/node_modules/virtual:tramvai/config.js`,
        // and this virtual module marked as removed by webpack, and it leads to immediate rebuild after initial compilation
        // 'virtual:tramvai/config': virtualTramvaiConfig,
        // alias from @tramvai/cli/lib/external/config will be resolved to this request
        '/node_modules/virtual:tramvai/config.js': virtualTramvaiConfig,
        // TCORE-5228 FIXME: when `@tramvai/cli/lib/external/config` import is used, it will resolve to `/node_modules/virtual:tramvai/browserslist.js`,
        // and this virtual module marked as removed by webpack, and it leads to immediate rebuild after initial compilation
        // 'virtual:tramvai/browserslist': `export default ${browserslistConfig}`,
        // alias from @tramvai/cli/lib/external/browserslist-normalized-file-config will be resolved to this request
        '/node_modules/virtual:tramvai/browserslist.js': `export default ${browserslistConfig}`,
      }),
      config.benchmark &&
        // require `@rsdoctor/rspack-plugin` here to speed up webpack worker initialization when benchmarking is not used
        new (require('@rsdoctor/rspack-plugin').RsdoctorRspackMultiplePlugin)(
          getBenchmarkRsdoctorOptions('server')
        ),
      config.analyze &&
        // require `@rsdoctor/rspack-plugin` here to speed up webpack worker initialization when analyze is not used
        new (require('@rsdoctor/rspack-plugin').RsdoctorRspackMultiplePlugin)(
          getAnalyzeRsdoctorOptions()
        ),
      config.showProgress &&
        // @ts-expect-error
        new WebpackBar({ name: 'server', color: 'orange', reporters: [new FancyReporter()] }),
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
      new rspack.container.ModuleFederationPluginV1({
        name: 'host',
        shared: getSharedModules(config),
      }),
      new rspack.ProvidePlugin({
        process: 'process',
        ...provideList,
      }),
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new RuntimePathPlugin({
        publicPath: process.env.ASSETS_PREFIX
          ? 'process.env.ASSETS_PREFIX'
          : `"${getApplicationUrl({
              host: config.staticHost,
              port: config.staticPort,
              protocol: config.httpProtocol,
            })}/${config.outputClient.replace(/\/$/, '')}/"`,
      }),
      config.dedupe.enabledDev &&
        new DedupePlugin({
          strategy: config.dedupe.strategy,
          ignorePackages: config.dedupe.ignore?.map((ignore) => new RegExp(`^${ignore}`)),
          showLogs: false,
        }),
      ...plugins.flat(),
    ].filter(Boolean),
  };
};
