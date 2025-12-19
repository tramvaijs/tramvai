import path from 'path';
import type Config from 'webpack-chain';
import ExtractCssChunks from 'mini-css-extract-plugin';
import { createGenerator } from '@tinkoff/minicss-class-generator';

import { safeRequire } from '../../../utils/safeRequire';
import type { ConfigManager } from '../../../config/configManager';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';
import { getActualTarget, getBrowserslistTargets } from '../utils/browserslist';

const cssLocalIdentNameDevDefault = '[name]__[local]_[minicss]';
const cssLocalIdentNameProdDefault = '[minicss]';

export const getPostcssConfigPath = (configManager: ConfigManager<CliConfigEntry>) => {
  return configManager.postcss.config ?? 'postcss.config';
};

interface Options {
  localIdentName?: string;
}

export const cssWebpackRulesFactory =
  (configManager: ConfigManager<CliConfigEntry>, options: Options = {}) =>
  (config: Config) => {
    const { env, sourceMap, buildType, experiments, target } = configManager;
    const {
      rootDir,
      postcss: {
        config: postcssConfig,
        cssLocalIdentName = env === 'production'
          ? cssLocalIdentNameProdDefault
          : cssLocalIdentNameDevDefault,
        cssModulePattern,
      },
    } = configManager;
    const isServer = configManager.buildType === 'server';
    const actualTarget = getActualTarget(target, isServer);
    const browsersListTargets = getBrowserslistTargets(rootDir, actualTarget);
    const localIdentName = options.localIdentName ?? cssLocalIdentName;

    const configCssLoader = (cfg) => {
      cfg
        .use('extract-css')
        .loader(ExtractCssChunks.loader)
        .options({
          esModule: false,
          // we don't need the css on server, but it's needed to generate proper classnames in js
          emit: buildType === 'client',
        } as ExtractCssChunks.LoaderOptions);

      const cssModulesOptions: Record<string, any> = {
        localIdentName,
      };

      if (cssModulePattern) {
        cssModulesOptions.auto = new RegExp(cssModulePattern);
      }

      // TODO: можно будет избавиться от проверки и оставить всё в minicss-плагине, когда зарелизят эти изменения
      // https://github.com/webpack-contrib/css-loader/blob/master/src/utils.js#L310
      if (/\[minicss]/.test(localIdentName)) {
        cssModulesOptions.getLocalIdent = createGenerator();
      }

      cfg.use('css').loader('css-loader').options({
        modules: cssModulesOptions,
        sourceMap,
        importLoaders: 1,
        esModule: false,
      });
    };

    const postcssCfg =
      safeRequire(
        path.resolve(configManager.rootDir, getPostcssConfigPath(configManager)),
        // ignore missed file if users haven't provided any value
        // in case the path was provided it should exist
        typeof postcssConfig === 'undefined'
      ) ?? {};

    // https://github.com/webpack-contrib/postcss-loader/blob/master/src/config.d.ts
    const postcssOptionsFn = (loaderContext: any) => {
      const isFnConfig = typeof postcssCfg === 'function';
      // TODO: async config fn support?
      const defaultConfig = isFnConfig ? postcssCfg(loaderContext) : postcssCfg;
      // eslint-disable-next-line no-nested-ternary
      const defaultPlugins = defaultConfig.plugins ? defaultConfig.plugins : [];

      return {
        config: false,
        ...defaultConfig,
        // TODO: придумать как прокинуть настройки browserslist в autoprefixer - сейчас autoprefixer добавляется в самом приложении и из
        // конфига нет возможности задавать динамический env в зависимости от сборки. Подсунуть в сам autoprefixer после его инициализации тоже
        // тоже не получится - https://github.com/postcss/autoprefixer/blob/10.3.1/lib/autoprefixer.js#L108
        plugins: Array.isArray(defaultPlugins)
          ? [
              require('postcss-modules-tilda'),
              require('postcss-modules-values-replace')({ importsAsModuleRequests: true }),
              ...defaultPlugins,
            ]
          : {
              'postcss-modules-tilda': {},
              'postcss-modules-values-replace': { importsAsModuleRequests: true },
              ...defaultPlugins,
            },
      };
    };

    // otherwise postcss-loader will use cosmiconfig to resolve postcss configuration file
    // https://github.com/webpack-contrib/postcss-loader/blob/6f470db420f6febbea729080921050e8fe353226/src/index.js#L38
    Object.assign(postcssOptionsFn, { config: false });

    config.module
      .rule('css')
      .test(/\.css$/)
      .batch(configCssLoader)
      .when(
        experiments.lightningcss,
        (cfg) => {
          const lightningcss = require('lightningcss');

          return cfg
            .use('lightningcss')
            .loader('lightningcss-loader')
            .options({
              options: {
                implementation: lightningcss,
                targets: browsersListTargets,
              },
            });
        },
        (cfg) =>
          cfg.use('postcss').loader('postcss-loader').options({
            sourceMap,
            postcssOptions: postcssOptionsFn,
          })
      );
  };

export default cssWebpackRulesFactory;
