import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import path from 'path';
import type Config from 'webpack-chain';
import { getAppRootDir } from '../utils/options';
import type { StorybookOptions } from '../types';

export function addPathsResolver({
  options,
  webpackConfig,
}: {
  options?: StorybookOptions;
  webpackConfig: Config;
}) {
  const rootDir = getAppRootDir(options);
  const tsConfigPath = path.join(rootDir, 'tsconfig.json');

  webpackConfig.resolve
    .plugin('resolve-plugin')
    .use(TsconfigPathsPlugin, [{ configFile: tsConfigPath }]);
}
