import Config from 'webpack-chain';
import type { ConfigManager } from '../../../../config/configManager';
import common from './common';
import optimize from '../../blocks/optimize';
import commonProd from '../../common/server/prod';
import type { ChildAppConfigEntry } from '../../../../typings/configEntry/child-app';
import sourcemaps from '../../blocks/sourcemaps';

export const webpackServerConfig = ({
  configManager,
}: {
  configManager: ConfigManager<ChildAppConfigEntry>;
}) => {
  const config = new Config();

  config.batch(common(configManager));
  config.batch(commonProd(configManager));

  config.batch(optimize(configManager));

  if (configManager.sourceMap) {
    config.batch(sourcemaps(configManager, 'server'));
  }

  return config;
};
