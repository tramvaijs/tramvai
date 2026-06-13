import type { Container } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import envTargets from '@tinkoff/browserslist-config';
import type { RuleSetRule } from '@rspack/core';
import browserslist from 'browserslist';
import { modernLibsFilter } from '@tinkoff/is-modern-lib';
import { BUILD_MODE_TOKEN } from '@tramvai/plugin-base-builder/lib/build-config';

import {
  Transpiler,
  TranspilerInputParameters,
} from '@tramvai/plugin-base-builder/lib/shared/transpiler';

export const resolveRspackTranspilerParameters = (
  {
    di,
    buildTarget,
    buildEnv = di.get(BUILD_MODE_TOKEN),
  }: {
    di: Container;
    buildTarget: 'server' | 'client';
    buildEnv?: 'development' | 'production';
  }
  // overrideOptions: Partial<WebpackTranspilerInputParameters> = {}
): TranspilerInputParameters => {
  const config = di.get(CONFIG_SERVICE_TOKEN);

  const {
    generateDataQaTag,
    enableFillDeclareActionNamePlugin,
    //   target,
    sourceDir,
    rootDir,
    //   enableFillActionNamePlugin,
    //   excludesPresetEnv,
    experiments: { reactCompiler },
  } = config;
  // const { env, modern } = configManager;
  const isServer = buildTarget === 'server';
  const actualTarget = isServer ? 'node' : 'defaults';

  // @ts-expect-error TODO
  return {
    isServer,
    env: buildEnv,
    generateDataQaTag,
    tramvai: true,
    removeTypeofWindow: true,
    include: config.transpilation.include,
    hot: !!config.hotRefresh?.enabled,
    // excludesPresetEnv,
    // enableFillActionNamePlugin,
    rootDir,
    sourceDir,
    actualTarget,
    browsersListTargets: getBrowserslistConfig(config.rootDir, actualTarget),
    loader: true,
    modules: false,
    typescript: false,
    enableFillDeclareActionNamePlugin,
    reactCompiler: reactCompiler ?? false,
    // ...overrideOptions,
  };
};

function getBrowserslistConfig(rootDir: string, actualTarget: 'node' | 'defaults') {
  const browserslistConfigRaw = browserslist.findConfig(rootDir);

  // Set defaults if the explicit config for browserslist was not found or the config does not contain the necessary targets
  const browserslistQuery =
    browserslistConfigRaw?.[actualTarget] ?? envTargets[actualTarget] ?? envTargets.defaults;
  const browsersListTargets = browserslist(browserslistQuery, {
    mobileToDesktop: true,
    env: actualTarget,
  });

  return browsersListTargets;
}

export const createTranspilerRules = ({
  transpiler,
  transpilerParameters,
}: {
  transpiler: Transpiler;
  transpilerParameters: TranspilerInputParameters;
}): RuleSetRule[] => {
  const { env } = transpilerParameters;
  const include =
    env === 'production'
      ? transpilerParameters.include?.production
      : transpilerParameters.include?.development;
  const shouldSkipTranspile = include === 'none';
  const shouldTranspileManualList = Array.isArray(include);
  const shouldTranspileOnlyModern = include === 'only-modern';
  const virtualList = [
    /[\\/]cli[\\/]lib[\\/]external[\\/]/,
    /[\\/]api[\\/]lib[\\/]virtual[\\/]/,
    /virtual:tramvai/,
  ];
  const manualIncludeList = Array.isArray(include)
    ? include.map((dependencyPath) => new RegExp(dependencyPath))
    : [];

  return [
    {
      test: /\.js$/,
      include: virtualList,
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory(transpilerParameters),
        },
      ],
    },
    {
      test: /\.[cm]?js[x]?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory(transpilerParameters),
        },
      ].filter(Boolean),
    },
    {
      test: /\.[cm]?js[x]?$/,
      include:
        // eslint-disable-next-line no-nested-ternary
        shouldSkipTranspile || shouldTranspileManualList
          ? manualIncludeList
          : shouldTranspileOnlyModern
            ? modernLibsFilter
            : /node_modules/,
      // thread-loader trying to resolve virtual modules as real files and fail webpack build,
      // so we should ignore such modules in our filter
      exclude: virtualList,
      // esm packages with invalid imports break build
      // if package.json has type module import must contain extension
      resolve: {
        fullySpecified: false,
      },
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({ ...transpilerParameters, hot: false }),
        },
      ].filter(Boolean),
    },
    {
      test: /\.ts[x]?$/,
      // test: [/\.ts[x]?$/, /^virtual:/],
      exclude: /node_modules/,
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({ ...transpilerParameters, typescript: true }),
        },
      ].filter(Boolean),
    },
  ];
};
