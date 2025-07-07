import type Config from 'webpack-chain';
import type { ConfigManager } from '../../../config/configManager';

export default (configManager: ConfigManager, target: 'client' | 'server') => (config: Config) => {
  if (configManager.debug || configManager.env === 'development') {
    config.module
      .rule('source-map-loader')
      .test(/\.js$/)
      .enforce('pre')
      .use('source-map')
      .loader('source-map-loader');

    // Chrome devtools does not support source maps with remote debug nodejs
    // PR with fix: https://github.com/nodejs/node/pull/58077
    config.devtool(target === 'server' ? 'inline-source-map' : 'source-map');
  } else {
    config.devtool('hidden-source-map');
  }
};
