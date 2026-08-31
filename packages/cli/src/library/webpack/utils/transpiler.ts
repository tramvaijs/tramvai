import type Config from 'webpack-chain';
import { sync as resolve } from 'resolve';

import { TranspilerInputParameters } from '@tramvai/plugin-base-builder/lib/shared/transpiler';

import type { ConfigManager } from '../../../config/configManager';
import { swcConfigFactory } from '../../swc';
import { babelConfigFactory } from '../../babel';
import type { CliConfigEntry, ReactCompilerOptions } from '../../../typings/configEntry/cli';
import { getActualTarget, getBrowserslistTargets } from './browserslist';

export const addTranspilerLoader =
  (configManager: ConfigManager<CliConfigEntry>, transpilerConfig: TranspilerInputParameters) =>
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

      return rule.loader('swc-loader').options(swcConfigFactory(transpilerConfig)).end();
    }

    if (loader === 'babel') {
      return rule.loader('babel-loader').options(babelConfigFactory(transpilerConfig)).end();
    }
  };

export const getTranspilerConfig = (
  configManager: ConfigManager<CliConfigEntry>,
  overrideOptions: Partial<TranspilerInputParameters> = {}
): TranspilerInputParameters => {
  const {
    generateDataQaTag,
    alias,
    target,
    rootDir,
    enableFillActionNamePlugin,
    experiments: { enableFillDeclareActionNamePlugin, reactCompiler, transpilation },
  } = configManager;
  const { env } = configManager;
  const isServer = configManager.buildType === 'server';

  if (alias) {
    console.warn(`"alias" option deprecated and ignored as cli now supports baseUrl and paths from the app's tsconfig.json file.
Just check or add configuration to your tsconfig file and remove alias from tramvai.json`);
  }

  const actualTarget = getActualTarget(target, isServer);
  const browsersListTargets = getBrowserslistTargets(rootDir, actualTarget);

  return {
    isServer,
    mode: env,
    // @ts-expect-error option only for new cli
    include: transpilation.include,
    generateDataQaTag,
    tramvai: true,
    removeTypeofWindow: true,
    hot: !!configManager.hotRefresh.enabled,
    enableFillActionNamePlugin,
    enableFillDeclareActionNamePlugin,
    rootDir: configManager.rootDir,
    actualTarget,
    browsersListTargets,
    loader: true,
    modules: false,
    typescript: false,
    reactCompiler,
    ...overrideOptions,
  };
};
