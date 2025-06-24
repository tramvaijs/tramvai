import path from 'node:path';
import type { Container } from '@tinkoff/dippy';
import type webpack from 'webpack';
import type { Config } from 'postcss-load-config';
import ExtractCssPlugin from 'mini-css-extract-plugin';
import { safeRequire } from '@tramvai/api/lib/utils/require';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';

type PostcssConfig = Config & { config: boolean };

export const createStylesConfiguration = ({
  di,
  emitCssChunks,
  extractCssPluginOptions,
}: {
  di: Container;
  emitCssChunks: boolean;
  extractCssPluginOptions: ExtractCssPlugin.PluginOptions;
}): {
  rules: webpack.RuleSetRule[];
  plugins: webpack.WebpackPluginInstance[];
} => {
  const config = di.get(CONFIG_SERVICE_TOKEN);

  const cssModulesOptions: Record<string, any> = {
    // TODO: localIdentName parameter
    localIdentName: '[name]__[local]_[minicss]',
    // TODO: getLocalIdent
  };

  const postcssConfig: Config | ((loaderContext: any) => Config) =
    safeRequire(
      resolveAbsolutePathForFile({
        file: config.postcss!.config ?? 'postcss.config.js',
        sourceDir: config.sourceDir,
        rootDir: config.rootDir,
      }),
      // ignore missed file if users haven't provided any value
      // in case the path was provided it should exist
      typeof config.postcss!.config === 'undefined'
    ) ?? ({} as Config);

  // https://github.com/webpack-contrib/postcss-loader/blob/master/src/config.d.ts
  const postcssOptionsFn = (loaderContext: any) => {
    const isFnConfig = typeof postcssConfig === 'function';
    // TODO: async config fn support?
    const defaultConfig = isFnConfig ? postcssConfig(loaderContext) : postcssConfig;
    // eslint-disable-next-line no-nested-ternary
    const defaultPlugins = defaultConfig.plugins ? defaultConfig.plugins : [];

    return {
      config: false,
      ...defaultConfig,
      // TODO: make it simple
      plugins: Array.isArray(defaultPlugins)
        ? [
            // TODO: do we really need it?
            // require('postcss-modules-tilda'),
            require('postcss-modules-values-replace')({
              importsAsModuleRequests: true,
            }),
            ...defaultPlugins,
          ]
        : {
            // TODO: do we really need it?
            // 'postcss-modules-tilda': {},
            'postcss-modules-values-replace': { importsAsModuleRequests: true },
            ...defaultPlugins,
          },
    } satisfies PostcssConfig;
  };

  // otherwise postcss-loader will use cosmiconfig to resolve postcss configuration file
  // https://github.com/webpack-contrib/postcss-loader/blob/6f470db420f6febbea729080921050e8fe353226/src/index.js#L38
  Object.assign(postcssOptionsFn, { config: false });

  return {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: ExtractCssPlugin.loader,
            options: {
              esModule: false,
              emit: emitCssChunks,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: cssModulesOptions,
              // TODO: sourcemaps parameter
              sourceMap: false,
              importLoaders: 1,
              esModule: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              // TODO: sourcemaps parameter
              sourceMap: false,
              postcssOptions: postcssOptionsFn,
            },
          },
        ],
      },
    ],
    plugins: [
      new ExtractCssPlugin({
        ignoreOrder: true,
        // TODO support parameter
        // experimentalUseImportModule: !!config.experiments.minicss?.useImportModule,
        ...extractCssPluginOptions,
      }),
    ],
  };
};
