import path from 'node:path';
import fs from 'node:fs/promises';
import type webpack from 'webpack';
import { Container, optional } from '@tinkoff/dippy';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

import { CONFIG_SERVICE_TOKEN, extensions } from '@tramvai/api/lib/config';
import { RESOLVE_EXTENSIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/resolve';

export const createResolveOptions = async ({
  di,
  mainFields,
}: {
  di: Container;
  mainFields: string[];
}): Promise<{ plugins: Required<Required<webpack.Configuration>['resolve']>['plugins'] }> => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const { rootDir, sourceDir } = config;

  const tsconfigPath = path.resolve(rootDir, 'tsconfig.json');
  const appTsconfigPath = path.resolve(rootDir, sourceDir, 'tsconfig.json');

  const tsconfigPathExists = !!(await fs.stat(tsconfigPath).catch(() => false));
  const appTsconfigPathExists = !!(await fs.stat(appTsconfigPath).catch(() => false));

  if (tsconfigPathExists || appTsconfigPathExists) {
    return {
      plugins: [
        new TsconfigPathsPlugin({
          configFile: appTsconfigPathExists ? appTsconfigPath : tsconfigPath,
          extensions: di.get(optional(RESOLVE_EXTENSIONS_TOKEN)) ?? extensions,
          mainFields,
          silent: true,
        }),
      ],
    };
  }

  return {
    plugins: [],
  };
};
