import type Config from 'webpack-chain';
import { sync as resolve } from 'resolve';
import envTargets from '@tinkoff/browserslist-config';
import browserslist from 'browserslist';
import type { ConfigManager } from '../../../config/configManager';
import { getSwcOptions } from '../../swc';
import { babelConfigFactory } from '../../babel';
import type { Env } from '../../../typings/Env';
import type { Target } from '../../../typings/target';
import type { CliConfigEntry, ReactCompilerOptions } from '../../../typings/configEntry/cli';

export type TranspilerConfig = {
  env: Env;
  target: Target;
  actualTarget: Target;
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

export const addTranspilerLoader =
  (configManager: ConfigManager<CliConfigEntry>, transpilerConfig: TranspilerConfig) =>
  (rule: Config.Use) => {
    const { loader } = configManager.experiments.transpilation;

    if (loader === 'swc') {
      try {
        resolve('@tramvai/swc-integration/package.json', { basedir: configManager.rootDir });
      } catch (error) {
        throw new Error(`You are using swc loader for the transpilation, but required module is not installed.
Please run "npx tramvai add --dev @tramvai/swc-integration" to fix the problem
      `);
      }

      return rule.loader('swc-loader').options(getSwcOptions(transpilerConfig)).end();
    }

    if (loader === 'babel') {
      return rule.loader('babel-loader').options(babelConfigFactory(transpilerConfig)).end();
    }
  };

export const getTranspilerConfig = (
  configManager: ConfigManager<CliConfigEntry>,
  overrideOptions: Partial<TranspilerConfig> = {}
): TranspilerConfig => {
  const {
    generateDataQaTag,
    alias,
    target,
    rootDir,
    enableFillActionNamePlugin,
    excludesPresetEnv,
    experiments: { enableFillDeclareActionNamePlugin, reactCompiler },
  } = configManager;
  const { env } = configManager;
  const isServer = configManager.buildType === 'server';

  if (alias) {
    console.warn(`"alias" option deprecated and ignored as cli now supports baseUrl and paths from the app's tsconfig.json file.
Just check or add configuration to your tsconfig file and remove alias from tramvai.json`);
  }

  let actualTarget = target;

  if (!target) {
    if (isServer) {
      actualTarget = 'node';
    }
  }

  const browserslistConfigRaw = browserslist.findConfig(rootDir);

  // Set defaults if the explicit config for browserslist was not found or the config does not contain the necessary targets
  const browserslistQuery =
    browserslistConfigRaw?.[actualTarget] ?? envTargets[actualTarget] ?? envTargets.defaults;

  const browsersListTargets = browserslist(browserslistQuery, {
    mobileToDesktop: true,
    env: actualTarget,
  });

  return {
    isServer,
    env,
    generateDataQaTag,
    tramvai: true,
    removeTypeofWindow: true,
    hot: !!configManager.hotRefresh.enabled,
    excludesPresetEnv,
    enableFillActionNamePlugin,
    rootDir: configManager.rootDir,
    target,
    actualTarget,
    browsersListTargets,
    loader: true,
    modules: false,
    typescript: false,
    enableFillDeclareActionNamePlugin,
    reactCompiler,
    ...overrideOptions,
  };
};
