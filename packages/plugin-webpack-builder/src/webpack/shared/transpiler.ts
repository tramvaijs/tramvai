import path from 'node:path';

import { createToken } from '@tinkoff/dippy';
import type { Container } from '@tinkoff/dippy';
import {
  CONFIG_SERVICE_TOKEN,
  ReactCompilerOptions,
  TranspilationOptions,
} from '@tramvai/api/lib/config';
import envTargets, { modern } from '@tinkoff/browserslist-config';
import type webpack from 'webpack';
import browserslist from 'browserslist';
import { modernLibsFilter } from '@tinkoff/is-modern-lib';
import { WorkerPoolConfig } from './thread-loader';
import { BUILD_MODE_TOKEN, BUILD_TARGET_TOKEN } from '../webpack-config';

export type WebpackTranspilerInputParameters = {
  // TODO: rename to "mode"
  env: 'development' | 'production';
  // TODO: useless
  target: 'node' | 'defaults' | 'modern';
  actualTarget: 'node' | 'defaults' | 'modern';
  // TODO: useless
  modern: boolean;
  isServer: boolean;
  generateDataQaTag: boolean;
  enableFillActionNamePlugin: boolean;
  enableFillDeclareActionNamePlugin: boolean;
  typescript: boolean;
  modules: 'es6' | 'commonjs' | false;
  loader: boolean;
  removeTypeofWindow: boolean;
  tramvai: boolean;
  hot: boolean;
  excludesPresetEnv: string[];
  rootDir: string;
  sourceDir: string;
  browsersListTargets: string[];
  reactCompiler: boolean | ReactCompilerOptions;
  include: TranspilationOptions['include'];
  /**
   * Enable or disable `loose` transformations:
   * with swc loader - https://swc.rs/docs/configuration/compilation#jscloose
   * with babel loader - https://babeljs.io/docs/babel-preset-env#loose
   */
  loose?: boolean;
  /**
   * Enable or disable external transpiler runtime helpers:
   * with swc loader, pass value directly to `jsc.externalHelpers` option - https://swc.rs/docs/configuration/compilation#jscexternalhelpers
   * with babel loader, when `false`, disable `@babel/plugin-transform-runtime` - https://babeljs.io/docs/babel-plugin-transform-runtime
   */
  externalHelpers?: boolean;
};

export type WebpackTranspiler = {
  /**
   * Name of webpack loader for processing JS and TS files
   */
  loader: string;
  /**
   * Configuration object to provided webpack loader
   */
  configFactory: (parameters: WebpackTranspilerInputParameters) => Record<string, any>;
  /**
   * Enable or not "thread-loader"
   */
  useThreadLoader?: boolean;
  /**
   * Warmup or not "thread-loader"
   */
  warmupThreadLoader?: boolean;
};

/**
 * @description Options for babel-loader or swc-loader
 */
export const WEBPACK_TRANSPILER_TOKEN = createToken<WebpackTranspiler>(
  'tramvai webpack transpiler'
);

export const resolveWebpackTranspilerParameters = (
  {
    di,
    buildTarget = di.get(BUILD_TARGET_TOKEN),
    buildEnv = di.get(BUILD_MODE_TOKEN),
  }: {
    di: Container;
    buildTarget?: 'server' | 'client';
    buildEnv?: 'development' | 'production';
  }
  // overrideOptions: Partial<WebpackTranspilerInputParameters> = {}
): WebpackTranspilerInputParameters => {
  const config = di.get(CONFIG_SERVICE_TOKEN);

  const {
    generateDataQaTag,
    enableFillDeclareActionNamePlugin,
    //   target,
    sourceDir,
    rootDir,
    //   enableFillActionNamePlugin,
    //   excludesPresetEnv,
    //   experiments: { reactCompiler },
  } = config;
  // const { env, modern } = configManager;
  const isServer = buildTarget === 'server';
  const actualTarget = isServer ? 'node' : 'defaults';

  // @ts-expect-error TODO
  return {
    isServer,
    env: buildEnv,
    generateDataQaTag,
    tramvai: true,
    removeTypeofWindow: true,
    include: config.transpilation.include,
    hot: !!config.hotRefresh?.enabled,
    // excludesPresetEnv,
    // enableFillActionNamePlugin,
    rootDir,
    sourceDir,
    actualTarget,
    browsersListTargets: getBrowserslistConfig(config.rootDir, actualTarget),
    loader: true,
    modules: false,
    typescript: false,
    enableFillDeclareActionNamePlugin,
    // reactCompiler,
    // ...overrideOptions,
  };
};

function getBrowserslistConfig(rootDir: string, actualTarget: 'node' | 'defaults') {
  const browserslistConfigRaw = browserslist.findConfig(rootDir);

  // Set defaults if the explicit config for browserslist was not found or the config does not contain the necessary targets
  const browserslistQuery =
    browserslistConfigRaw?.[actualTarget] ?? envTargets[actualTarget] ?? envTargets.defaults;
  const browsersListTargets = browserslist(browserslistQuery, {
    mobileToDesktop: true,
    env: actualTarget,
  });

  return browsersListTargets;
}

export const createTranspilerRules = ({
  transpiler,
  transpilerParameters,
  workerPoolConfig,
}: {
  transpiler: WebpackTranspiler;
  transpilerParameters: WebpackTranspilerInputParameters;
  workerPoolConfig: WorkerPoolConfig;
}): webpack.RuleSetRule[] => {
  const { env } = transpilerParameters;
  const include =
    env === 'production'
      ? transpilerParameters.include?.production
      : transpilerParameters.include?.development;
  const shouldSkipTranspile = include === 'none';
  const shouldTranspileManualList = Array.isArray(include);
  const shouldTranspileOnlyModern = include === 'only-modern';
  const defaultIncludeList = [
    /[\\/]cli[\\/]lib[\\/]external[\\/]/,
    /[\\/]api[\\/]lib[\\/]virtual[\\/]/,
    /virtual:tramvai/,
  ];
  const manualIncludeList = Array.isArray(include)
    ? include.map((dependencyPath) => new RegExp(dependencyPath)).concat(defaultIncludeList)
    : defaultIncludeList;

  return [
    {
      test: /\.[cm]?js[x]?$/,
      exclude: /node_modules/,
      use: [
        transpiler.useThreadLoader && {
          loader: 'thread-loader',
          options: workerPoolConfig,
        },
        {
          loader: transpiler.loader,
          options: transpiler.configFactory(transpilerParameters),
        },
      ].filter(Boolean),
    },
    {
      test: /\.[cm]?js[x]?$/,
      include:
        // eslint-disable-next-line no-nested-ternary
        shouldSkipTranspile || shouldTranspileManualList
          ? manualIncludeList
          : shouldTranspileOnlyModern
            ? modernLibsFilter
            : /node_modules/,
      // thread-loader trying to resolve virtual modules as real files and fail webpack build,
      // so we should ignore such modules in our filter
      exclude: [/virtual:tramvai/],
      use: [
        transpiler.useThreadLoader && {
          loader: 'thread-loader',
          options: workerPoolConfig,
        },
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({ ...transpilerParameters, hot: false }),
        },
      ].filter(Boolean),
    },
    {
      test: /\.ts[x]?$/,
      // test: [/\.ts[x]?$/, /^virtual:/],
      exclude: /node_modules/,
      use: [
        transpiler.useThreadLoader && {
          loader: 'thread-loader',
          options: workerPoolConfig,
        },
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({ ...transpilerParameters, typescript: true }),
        },
      ].filter(Boolean),
    },
  ];
};
