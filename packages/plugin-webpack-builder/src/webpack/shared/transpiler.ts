import { createToken } from '@tinkoff/dippy';
import type { Container } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN, ReactCompilerOptions } from '@tramvai/api/lib/config';
import envTargets from '@tinkoff/browserslist-config';
import type webpack from 'webpack';
import browserslist from 'browserslist';
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
  browsersListTargets: string[];
  reactCompiler: boolean | ReactCompilerOptions;
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
  }: {
    di: Container;
  }
  // overrideOptions: Partial<WebpackTranspilerInputParameters> = {}
): WebpackTranspilerInputParameters => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const buildTarget = di.get(BUILD_TARGET_TOKEN);
  const buildEnv = di.get(BUILD_MODE_TOKEN);

  const {
    generateDataQaTag,
    //   target,
    //   rootDir,
    //   enableFillActionNamePlugin,
    //   excludesPresetEnv,
    //   experiments: { enableFillDeclareActionNamePlugin, reactCompiler },
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
    // hot: !!configManager.hotRefresh.enabled,
    // excludesPresetEnv,
    // enableFillActionNamePlugin,
    rootDir: config.rootDir,
    actualTarget,
    browsersListTargets: getBrowserslistConfig(config.rootDir, actualTarget),
    loader: true,
    modules: false,
    typescript: false,
    // enableFillDeclareActionNamePlugin,
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
  return [
    {
      test: /\.[cm]?js[x]?$/,
      // test: [/\.[cm]?js[x]?$/, /^virtual:/],
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
