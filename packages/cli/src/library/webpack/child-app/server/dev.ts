import Config from 'webpack-chain';
import WebpackBar from 'webpackbar';
import type { ConfigManager } from '../../../../config/configManager';
import common from './common';
import commonDev from '../../common/dev';
import type { UI_SHOW_PROGRESS_TOKEN } from '../../../../di/tokens';
import type { ChildAppConfigEntry } from '../../../../typings/configEntry/child-app';
import FancyReporter from '../../plugins/WebpackBar/reporters/fancy';
import sourcemaps from '../../blocks/sourcemaps';

export const webpackServerConfig = ({
  configManager,
  showProgress,
}: {
  configManager: ConfigManager<ChildAppConfigEntry>;
  showProgress: typeof UI_SHOW_PROGRESS_TOKEN | null;
}) => {
  const config = new Config();

  config.batch(common(configManager));
  config.batch(commonDev(configManager));

  config.mode('development');
  config.devtool(configManager.webpack.devtool ?? false);

  if (configManager.sourceMap) {
    config.batch(sourcemaps(configManager, 'server'));
  }

  if (showProgress) {
    config.plugin('progress').use(WebpackBar, [
      {
        name: 'child-app-server',
        color: 'orange',
        reporters: [new FancyReporter()],
      },
    ]);
  }

  config.plugin('define').tap((args) => [
    {
      ...args[0],
      'process.env.NODE_ENV': '"development"',
    },
  ]);

  return config;
};
