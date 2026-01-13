import type { Configuration } from 'webpack';
import { modernLibsFilter } from '@tinkoff/is-modern-lib';
import { babelConfigFactory } from '../babel/babelConfigFactory';
import { StorybookOptions } from '../types';

export const defaultIncludeList = [
  /[\\/]cli[\\/]lib[\\/]external[\\/]/,
  /[\\/]api[\\/]lib[\\/]virtual[\\/]/,
  /virtual:tramvai/,
];

export function addNodeModulesTranspile({
  baseConfig,
  options,
}: {
  baseConfig: Configuration;
  options?: StorybookOptions;
}) {
  baseConfig.module?.rules?.push({
    test: /\.[cm]?js[x]?$/,
    include: getLoaderInclude(options?.dependenciesTranspiling),
    // already processed in storybook loaders
    exclude: /node_modules\/acorn-jsx/,
    loader: 'babel-loader',
    options: babelConfigFactory({ typescript: false }),
  });
}

function getLoaderInclude(include: StorybookOptions['dependenciesTranspiling']) {
  if (include === 'only-modern' || !include) {
    return modernLibsFilter;
  }

  if (Array.isArray(include)) {
    return include.map((item) => new RegExp(item)).concat(defaultIncludeList);
  }

  if (include === 'none') {
    return defaultIncludeList;
  }

  return [/node_modules/];
}
