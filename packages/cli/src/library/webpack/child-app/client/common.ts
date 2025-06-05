import type Config from 'webpack-chain';
import { ChunkCorrelationPlugin } from '@module-federation/node';
import LoadablePlugin from '@loadable/webpack-plugin';

import type { ConfigManager } from '../../../../config/configManager';

import common from '../common';
import files from '../../blocks/filesClient';
import nodeClient from '../../blocks/nodeClient';
import postcssAssets from '../../blocks/postcssAssets';
import type { ChildAppConfigEntry } from '../../../../typings/configEntry/child-app';
import { purifyStatsPluginFactory } from '../../plugins/PurifyStatsPlugin';

const IDENTIFIER_NAME_REPLACE_REGEX = /^([^a-zA-Z$_])/;
const IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX = /[^a-zA-Z0-9$]+/g;

// https://github.com/webpack/webpack/blob/da41ad1845947139375fb557107fa8bd2f6f8f27/lib/Template.js#L108
function toIdentifier(str: string) {
  return str
    .replace(IDENTIFIER_NAME_REPLACE_REGEX, '_$1')
    .replace(IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX, '_');
}

export default (configManager: ConfigManager<ChildAppConfigEntry>) => (config: Config) => {
  const { name, version } = configManager;
  config.name('client');

  config.batch(common(configManager));

  config.target(['web']);

  config.output
    .path(configManager.buildPath)
    .publicPath('auto')
    .library(configManager.name)
    .filename(`[name]_client@${version}.js`)
    .chunkFilename('[name]_client.chunk.[contenthash].js')
    .crossOriginLoading('anonymous');

  config.batch(postcssAssets(configManager));

  config.plugin('stats-plugin').use(ChunkCorrelationPlugin, [
    {
      filename: `${name}_stats@${version}.json`,
    },
  ]);

  const statsFileName = `${name}_stats_loadable@${version}.json`;
  config.plugin('loadable-stats-plugin').use(LoadablePlugin, [
    {
      filename: statsFileName,
      outputAsset: true,
      // to prevent webpack modules with same id collision, because Child Apps builds are independent of each other
      chunkLoadingGlobal: toIdentifier(`__LOADABLE_LOADED_CHUNKS__child_app_${name}_${version}__`),
    },
  ]);

  config
    .plugin('assets-purify-plugin')
    .use(purifyStatsPluginFactory('child-app'), [{ fileName: statsFileName }]);

  config.batch(files(configManager)).batch(nodeClient(configManager));
};
