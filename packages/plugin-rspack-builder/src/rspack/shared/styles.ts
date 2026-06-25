import type { Container } from '@tinkoff/dippy';
import rspack, {
  RuleSetRule,
  RspackPluginInstance,
  CssExtractRspackPluginOptions,
} from '@rspack/core';
import type { Config } from 'postcss-load-config';
import { createGenerator } from '@tinkoff/minicss-class-generator';
import autoprefixer from 'autoprefixer';
// import imageSetPolyfill from 'postcss-image-set-polyfill';
import { safeRequire } from '@tramvai/api/lib/utils/require';
import { CONFIG_SERVICE_TOKEN, ConfigService } from '@tramvai/api/lib/config';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';

const mediaVars = {
  PHONE: 599,
  TABLETS: 600,
  MOBILE: 1023,
  DESKTOP: 1024,
};

type PostcssConfig = Config & { config: boolean };

export const getPostcssConfigPath = (config: ConfigService) => {
  return resolveAbsolutePathForFile({
    file: config.postcss!.config ?? 'postcss.config.js',
    sourceDir: config.sourceDir,
    rootDir: config.rootDir,
  });
};

export const createStylesConfiguration = ({
  di,
  emitCssChunks,
  extractCssPluginOptions,
  sourceMap,
  browserslistConfig,
  buildTarget,
}: {
  di: Container;
  emitCssChunks: boolean;
  sourceMap: boolean;
  extractCssPluginOptions: CssExtractRspackPluginOptions;
  browserslistConfig: string[];
  buildTarget: 'client' | 'server';
}): {
  rules: RuleSetRule[];
  plugins: RspackPluginInstance[];
} => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const { mode } = config;

  const { cssLocalIdentName, cssModulePattern } = config.postcss ?? {};

  const cssModulesOptions: Record<string, any> = {
    localIdentName: '[name]__[local]_[minicss]',
  };

  if (typeof cssLocalIdentName === 'string') {
    cssModulesOptions.localIdentName = cssLocalIdentName;
  } else if (mode === 'development' && cssModulesOptions.development) {
    cssModulesOptions.localIdentName = cssLocalIdentName?.development;
  } else if (mode === 'production' && cssModulesOptions.production) {
    cssModulesOptions.localIdentName = cssLocalIdentName?.production;
  }

  if (/\[minicss]/.test(cssModulesOptions.localIdentName)) {
    cssModulesOptions.getLocalIdent = createGenerator();
  }

  if (cssModulePattern) {
    cssModulesOptions.auto = new RegExp(cssModulePattern);
  }

  return {
    rules: [
      {
        test: /\.css$/,
        type: 'javascript/auto',
        use: [
          {
            loader: rspack.CssExtractRspackPlugin.loader,
            options: {
              esModule: false,
              emit: emitCssChunks,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: cssModulesOptions,
              sourceMap,
              importLoaders: 1,
              esModule: false,
            },
          },
          config.experiments.lightningcss
            ? {
                loader: 'builtin:lightningcss-loader',
                options: {
                  targets: browserslistConfig,
                },
              }
            : {
                loader: 'postcss-loader',
                options: {
                  sourceMap,
                  postcssOptions: getPostCssOptions(config),
                },
              },
        ],
      },
      config.deprecatedLessSupport && {
        test: /\.less$/,
        use: [
          {
            loader: rspack.CssExtractRspackPlugin.loader,
            options: {
              esModule: false,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap,
              esModule: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap,
              postcssOptions: {
                plugins: [
                  // imageSetPolyfill,
                  autoprefixer({
                    env: buildTarget,
                  }),
                ],
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap,
              lessOptions: {
                globalVars: {
                  mediaDesktop: mediaVars.DESKTOP,
                  mediaMobile: mediaVars.MOBILE,
                  mediaTablets: mediaVars.TABLETS,
                  mediaPhone: mediaVars.PHONE,
                },
              },
            },
          },
        ],
      },
    ].filter(Boolean) as RuleSetRule[],
    plugins: [
      new rspack.CssExtractRspackPlugin({
        ignoreOrder: true,
        // TODO support parameter
        // experimentalUseImportModule: !!config.experiments.minicss?.useImportModule,
        ...extractCssPluginOptions,
      }),
    ],
  };
};

function getPostCssOptions(config: ConfigService) {
  // TODO: PostcssAssetsPlugin integration from packages/cli/src/library/webpack/blocks/postcssAssets.ts?

  const postcssConfig: Config | ((loaderContext: any) => Config) =
    safeRequire(
      getPostcssConfigPath(config),
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

  return postcssOptionsFn;
}
