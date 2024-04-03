import path from 'path';
import type Config from 'webpack-chain';
import SparkMD5 from 'spark-md5';
import type { ConfigManager } from '../../../config/configManager';
import { addSvgrLoader, getSvgoOptions } from '../utils/files';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';

export const filesClientWebpackRulesFactory =
  (configManager: ConfigManager<CliConfigEntry>) => (config: Config) => {
    const svgoOptions = getSvgoOptions(configManager);

    config.module
      .rule('woff')
      .test(/\.woff2?$/)
      .set('type', 'asset');

    addSvgrLoader(configManager, config, svgoOptions);

    config.module
      .rule('svg')
      .test(/\.svg$/)
      .set('resourceQuery', { not: /react/ })
      .set('type', 'asset/resource')
      .set('generator', {
        filename: (pathInfo) => {
          // hash computation exactly how it is working in react-ui-kit
          // TODO: it leads to high coherence with ui-kit, better change it to some other method
          return `${SparkMD5.hash(pathInfo.module.originalSource().source().toString())}.svg`;
        },
      })
      .use('svg')
      .loader('svgo-loader')
      .options(svgoOptions);

    config.module
      .rule('tramvai-image')
      .test(/\.(png|jpe?g|gif|webp)$/)
      .use('file')
      .loader(path.resolve(__dirname, '../loaders/image-loader'))
      .end();

    config.module
      .rule('video')
      .test(/\.(mp4|webm|avif)$/)
      .set('type', 'asset/resource');

    if (configManager.imageOptimization?.enabled) {
      config.module
        .rule('image-optimization')
        .test(/\.(gif|png|jpe?g|svg)$/)
        .use('image')
        .loader('image-webpack-loader')
        .options({ ...(configManager.imageOptimization?.options as any) })
        .end()
        .enforce('pre');
    }
  };

export default filesClientWebpackRulesFactory;
