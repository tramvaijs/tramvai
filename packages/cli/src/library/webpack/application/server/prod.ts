import Config from 'webpack-chain';
import TerserPlugin from 'terser-webpack-plugin';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';

import RuntimePathPlugin from '../../plugins/RuntimePathPlugin';
import common from './common';
import sourcemaps from '../../blocks/sourcemaps';
import commonProd from '../../common/server/prod';

export const webpackServerConfig = ({
  configManager,
}: {
  configManager: ConfigManager<ApplicationConfigEntry>;
}) => {
  const config = new Config();
  const { debug, sourceMap } = configManager;

  config.batch(common(configManager));
  config.batch(commonProd(configManager));

  config.bail(true);

  config.externals(configManager.externals.map((s) => new RegExp(`^${s}`)));

  const minifierValueFromConfig = configManager.experiments.minifier;
  const minifier =
    minifierValueFromConfig === 'swc' ? TerserPlugin.swcMinify : TerserPlugin.terserMinify;

  if (configManager.disableProdOptimization) {
    // with this option for id of module path to file will be used
    config.optimization.set('moduleIds', 'named');
    // prevent modules from concatenation in single module to easier debug
    config.optimization.set('concatenateModules', false);

    config.plugin('terser').use(TerserPlugin, [
      {
        minify: minifier,
        extractComments: false,
        terserOptions: {
          ecma: 5, // на сервере в страницу встраивается код, который может подключаться через import и terser его соптимизирует в es6
          mangle: false,
          // сохраняем имена функций, чтобы легче было найти ошибку в трамвае
          keep_fnames: true,
          compress: {
            passes: 2,
            drop_debugger: !debug,
            dead_code: true,
          },
          output: {
            comments: true,
            semicolons: false,
            preserve_annotations: true,
            // currently doesn't support by swc
            ...(minifierValueFromConfig === 'swc' ? {} : { indent_start: 2 }),
            beautify: true,
          },
        },
      },
    ]);
  } else {
    config.plugin('terser').use(TerserPlugin, [
      {
        minify:
          configManager.experiments.minifier === 'swc'
            ? TerserPlugin.swcMinify
            : TerserPlugin.terserMinify,
        extractComments: false,
        terserOptions: {
          ecma: 5, // на сервере в страницу встраивается код, который может подключаться через import и terser его соптимизирует в es6
          mangle: false,
          // сохраняем имена функций, чтобы легче было найти ошибку в трамвае
          keep_fnames: true,
          compress: {
            passes: 2,
            drop_debugger: !debug,
            dead_code: true,
          },
          output: {
            comments: false,
          },
        },
      },
    ]);
  }

  // RuntimePathPlugin необходим для правильной генерации ссылок на ассеты (картинки и т.п. которые грузятся через file-loader или url-loader)
  config.plugin('runtime-path').use(RuntimePathPlugin, [
    {
      publicPath: 'process.env.ASSETS_PREFIX',
    },
  ]);

  if (sourceMap) {
    config.batch(sourcemaps(configManager));
  }

  return config;
};
