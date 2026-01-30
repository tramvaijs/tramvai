import path from 'path';
import Config from 'webpack-chain';
import WebpackBar from 'webpackbar';

import { RuntimePathPlugin } from '@tramvai/plugin-webpack-builder';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';

import common from './common';
import commonDev from '../../common/dev';
import { commonApplicationDev } from '../dev';
import configResolve from '../../blocks/configResolve';
import type { UI_SHOW_PROGRESS_TOKEN } from '../../../../di/tokens';
import sourcemaps from '../../blocks/sourcemaps';
import FancyReporter from '../../plugins/WebpackBar/reporters/fancy';
import { getApplicationUrl } from '../../../../utils/getApplicationUrl';

export const webpackServerConfig = ({
  configManager,
  showProgress,
}: {
  configManager: ConfigManager<ApplicationConfigEntry>;
  showProgress: typeof UI_SHOW_PROGRESS_TOKEN | null;
}) => {
  const config = new Config();

  config.batch(common(configManager));
  config.batch(commonDev(configManager));
  config.batch(
    commonApplicationDev({
      entry: path.resolve(configManager.rootDir, `${configManager.root}/index`),
      onlyBundles: configManager.onlyBundles,
    })
  );
  config.batch(configResolve(configManager));

  config.mode('development');

  config.devtool(configManager.webpack.devtool ?? false);

  if (configManager.sourceMap) {
    config.batch(sourcemaps(configManager, 'server'));
  }

  if (configManager.noServerRebuild) {
    config.watchOptions({
      ignored: /.*/,
    });
  } else {
    config.watchOptions(
      configManager.webpack.watchOptions ?? {
        aggregateTimeout: 20,
        ignored: configManager.debug ? ['**/.git/**'] : ['**/node_modules/**', '**/.git/**'],
      }
    );
  }

  config.externals(
    ['react$', 'react-dom', 'prop-types', 'fastify', 'core-js', ...configManager.externals].map(
      (s) => new RegExp(`^${s}`)
    )
  );

  config.optimization.set('emitOnErrors', false);

  if (showProgress) {
    config.plugin('progress').use(WebpackBar, [
      {
        name: 'server',
        color: 'orange',
        reporters: [new FancyReporter()],
      },
    ]);

    if (configManager.profile) {
      config
        .plugin('progress')
        .tap((args) => [{ ...args[0], profile: true, reporters: ['profile'] }]);
    }
  }

  config.plugin('define').tap((args) => [
    {
      ...args[0],
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.HOST_STATIC': JSON.stringify(configManager.staticHost),
      'process.env.PORT_STATIC': JSON.stringify(configManager.staticPort),
    },
  ]);

  config.plugin('runtime-path').use(RuntimePathPlugin, [
    {
      publicPath: process.env.ASSETS_PREFIX
        ? 'process.env.ASSETS_PREFIX'
        : `"${getApplicationUrl({
            host: configManager.staticHost,
            port: configManager.staticPort,
            protocol: configManager.httpProtocol,
          })}/${configManager.output.client.replace(/\/$/, '')}/"`,
    },
  ]);

  return config;
};
