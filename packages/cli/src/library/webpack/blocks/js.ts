import type Config from 'webpack-chain';
import { modernLibsFilter } from '@tinkoff/is-modern-lib';
import { applyThreadLoader } from '../utils/threadLoader';
import type { ConfigManager } from '../../../config/configManager';
import { getTranspilerConfig, addTranspilerLoader } from '../utils/transpiler';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';

const projectRulesName = 'project';
const nodeModuleRulesName = 'node_module';

const applyProjectRules = (rule, configManager) => {
  rule
    .oneOf(projectRulesName)
    .exclude.add(/node_modules/)
    .end()
    .use('transpiler')
    .batch(addTranspilerLoader(configManager, getTranspilerConfig(configManager)))
    .end();
};

const applyNodeModulesRules = (rule, configManager) => {
  rule
    .oneOf(nodeModuleRulesName)
    .merge({
      // true value forces to use file extensions for importing mjs modules
      // but we want to use mjs if it exists anyway
      resolve: { fullySpecified: false },
    })
    .use('transpiler')
    .batch(addTranspilerLoader(configManager, getTranspilerConfig(configManager, { hot: false })));
};

// eslint-disable-next-line import/no-default-export
export default (configManager: ConfigManager<CliConfigEntry>) => (config: Config) => {
  const { transpileOnlyModernLibs } = configManager;
  const { include } = configManager.experiments.transpilation;
  const shouldTranspileOnlyModern = transpileOnlyModernLibs || include === 'only-modern';

  const rule = config.module
    .rule('js')
    .test(/\.[cm]?js[x]?$/)
    .batch(applyThreadLoader(configManager));

  if (configManager.env === 'production') {
    applyProjectRules(rule, configManager);
    applyNodeModulesRules(rule, configManager);

    if (shouldTranspileOnlyModern) {
      rule.oneOf(nodeModuleRulesName).include.add(modernLibsFilter);
    }
  } else {
    const shouldSkipTranspiling = include === 'none';
    const shouldSelectiveTranspile = Array.isArray(include);

    if (shouldSkipTranspiling) {
      rule.exclude
        .add(/node_modules/)
        .end()
        .use('transpiler')
        .batch(addTranspilerLoader(configManager, getTranspilerConfig(configManager)));
    } else {
      applyProjectRules(rule, configManager);
      applyNodeModulesRules(rule, configManager);

      if (shouldSelectiveTranspile) {
        const includeForTranspiling = (<string[]>include).map(
          (includePath) => new RegExp(includePath)
        );

        includeForTranspiling.forEach((includePath) => {
          rule.oneOf(nodeModuleRulesName).include.add(includePath);
        });
      } else if (shouldTranspileOnlyModern) {
        if (shouldTranspileOnlyModern) {
          rule.oneOf(nodeModuleRulesName).include.add(modernLibsFilter);
        }
      }
    }
  }
};
