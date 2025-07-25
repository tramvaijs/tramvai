import Config from 'webpack-chain';
import type { ConfigManager } from '../../../../config/configManager';
import common from './common';
import optimize from '../../blocks/optimize';
import commonProd from '../../common/client/prod';
import type { ChildAppConfigEntry } from '../../../../typings/configEntry/child-app';
import sourcemaps from '../../blocks/sourcemaps';

export const webpackClientConfig = ({
  configManager,
}: {
  configManager: ConfigManager<ChildAppConfigEntry>;
}) => {
  const config = new Config();

  config.batch(common(configManager));
  config.batch(commonProd(configManager));

  if (configManager.sourceMap) {
    config.batch(sourcemaps(configManager, 'client'));
  }

  config.batch(optimize(configManager));

  return config;
};
