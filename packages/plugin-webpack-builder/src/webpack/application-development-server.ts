/* eslint-disable max-statements, complexity */
import path from 'node:path';
import { Writable } from 'node:stream';
import webpack from 'webpack';
import type { Configuration } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
// @ts-expect-error
import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';

import flatten from '@tinkoff/utils/array/flatten';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { optional } from '@tinkoff/dippy';
import {
  resolveAbsolutePathForFile,
  resolveAbsolutePathForFolder,
} from '@tramvai/api/lib/utils/path';
import { DedupePlugin } from '@tinkoff/webpack-dedupe-plugin';

import { VirtualProtocolPlugin } from './plugins/virtual-protocol-plugin';
import { resolvePublicPathDirectory } from './utils/publicPath';
import { resolveUrl } from '../utils/url';
import {
  WEBPACK_TRANSPILER_TOKEN,
  createTranspilerRules,
  resolveWebpackTranspilerParameters,
} from './shared/transpiler';
import { createWorkerPoolConfig, warmupThreadLoader } from './shared/thread-loader';
import { configToEnv } from './shared/config-to-env';
import { WEBPACK_DEBUG_STATS_OPTIONS } from './shared/stats';
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
import { normalizeBrowserslistConfig } from './shared/browserslist';
import { WorkerProgressPlugin } from './plugins/progress-plugin';
import { createSnapshot } from './shared/snapshot';
import { createAssetsRules } from './shared/assets';
import { WEBPACK_EXTERNALS_TOKEN } from './shared/externals';
import { createServerInlineRules } from './shared/server-inline';
import { WEBPACK_PLUGINS_TOKEN } from './shared/plugins';
import { createOptimizeOptions } from './shared/optimization';
import { PROVIDE_TOKEN } from './shared/provide';
import { CACHE_ADDITIONAL_FLAGS_TOKEN, createCacheConfig } from './shared/cache';
import { ignoreWarnings } from './utils/warningsFilter';
import { createSourceMaps } from './shared/sourcemaps';
import { getSharedModules } from './shared/shared-modules';
import { ModuleFederationIgnoreEntries } from './plugins/ModuleFederationIgnoreEntries';
import { ModuleFederationFixRange } from './plugins/ModuleFederationFixRange';
import { getAnalyzeRsdoctorOptions, getBenchmarkRsdoctorOptions } from './shared/rsdoctor';

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

export const webpackConfig: WebpackConfigurationFactory = async ({
  di,
}): Promise<Configuration> => {
  const config = di.get(CONFIG_SERVICE_TOKEN);

  const { verboseLogging } = config;

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

  const normalizedBrowserslistConfig = normalizeBrowserslistConfig(config);
  const browserslistConfig = JSON.stringify(normalizedBrowserslistConfig);

  const virtualModulesPlugin = new VirtualModulesPlugin({
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
  });

  if (transpiler.warmupThreadLoader) {
    warmupThreadLoader(workerPoolConfig);
  }

  const isRootErrorBoundaryEnabled =
    typeof config.fileSystemPages!.rootErrorBoundaryPath === 'string';

  // TODO: test cacheUnaffected, lazyCompilation

  // TODO: output.strictModuleExceptionHandling, module.strictExportPresence - do we really need it?

  const sourceMapsConfiguration = createSourceMaps({ config, target: 'server' });

  const resolveOptions = await createResolveOptions({ di, mainFields });

  return {
    // https://webpack.js.org/configuration/target/#browserslist
    target: normalizedBrowserslistConfig.node
      ? `browserslist:${normalizedBrowserslistConfig.node}`
      : 'node',
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
    cache: createCacheConfig({
      config,
      additionalCacheFlags,
      transpilerParameters,
      target: 'server',
    }),
    output: {
      path: resolveAbsolutePathForFolder({ folder: config.outputServer, rootDir: config.rootDir }),
      publicPath: `${resolveUrl({
        host: config.staticHost,
        port: config.staticPort,
        protocol: config.httpProtocol,
      })}${resolvePublicPathDirectory(config.outputClient)}`,
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
    devtool: config.sourceMap ? sourceMapsConfiguration.devtool : webpackConfigExtension.devtool,
    node: {
      // TODO https://github.com/tramvaijs/tramvai/-/commit/c3f3db838fd711ee7a53a84f5bd832cdeebc293a
      // __dirname: false
      // "warn" with `futureDefaults`
      global: true,
    },
    resolve: {
      // support for https://nodejs.org/api/addons.html
      extensions: [...extensions, '.node'],
      mainFields,
      symlinks: config.resolveSymlinks,
      fallback,
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
      plugins: [...resolveOptions.plugins],
    },
    watchOptions: config.noServerRebuild
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
      ...createOptimizeOptions({ config, target: 'server' }),
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
    // TODO: research why this list?
    externals: [
      'react$',
      'react-dom',
      'prop-types',
      'fastify',
      'core-js',
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
        // *.inline files rules should be before the transpiler rules
        ...createServerInlineRules({ di }),
        ...createTranspilerRules({
          transpiler,
          transpilerParameters,
          workerPoolConfig,
        }),
        ...stylesConfiguration.rules,
        ...createAssetsRules({ di }),
        {
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
        {
          test: /[\\/]api[\\/]lib[\\/]virtual[\\/]file-system-papi.js$/,
          loader: path.resolve(__dirname, './loaders/file-system-papi'),
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
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      config.benchmark && new RsdoctorWebpackPlugin(getBenchmarkRsdoctorOptions('server')),
      config.analyze && new RsdoctorWebpackPlugin(getAnalyzeRsdoctorOptions()),
      virtualModulesPlugin,
      new VirtualProtocolPlugin(),
      ...stylesConfiguration.plugins,
      new webpack.container.ModuleFederationPlugin({
        name: 'host',
        shared: getSharedModules(config),
      }),
      new ModuleFederationIgnoreEntries({ entries: ['polyfill', 'modern.polyfill'] }),
      new ModuleFederationFixRange({
        flexibleTramvaiVersions: config.shared?.flexibleTramvaiVersions,
      }),
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
      new webpack.ProvidePlugin({
        process: 'process',
        ...provideList,
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
