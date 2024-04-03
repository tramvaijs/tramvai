import path from 'path';
import webpack from 'webpack';
import type Config from 'webpack-chain';
import type { CliConfigEntry, ConfigManager } from '@tramvai/cli';
import { configToEnv } from '@tramvai/cli';
import { getAppRootDir } from '../utils/options';
import type { StorybookOptions } from '../types';

export function addEnvVariables({
  webpackConfig,
  configManager,
  options,
}: {
  webpackConfig: Config;
  configManager: ConfigManager<CliConfigEntry>;
  options: StorybookOptions;
}) {
  const rootDir = getAppRootDir(options);
  let envFromFile: Record<string, string> = {};

  try {
    envFromFile = require(path.join(rootDir, 'env.development.js'));
  } catch (e) {
    console.error('env.development.js parsing failed, reason:', e);
  }

  webpackConfig.plugin('define').use(webpack.DefinePlugin, [
    {
      ...configManager.define.shared,
      ...configManager.define[configManager.env],
      'process.env.NODE_ENV': JSON.stringify(configManager.env),
      'process.env.APP_ID': JSON.stringify(configManager.name),
      'process.env.BROWSER': true,
      'process.env.SERVER': false,
      // pass `env.development.js` content to client code for env manager
      'process.env.TRAMVAI_ENV_FROM_FILE': JSON.stringify(envFromFile),
    },
  ]);

  configToEnv(configManager)(webpackConfig);
}
