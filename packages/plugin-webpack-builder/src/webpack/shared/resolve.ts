import path from 'node:path';
import fs from 'node:fs/promises';
import { Container, createToken, optional } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN, extensions } from '@tramvai/api/lib/config';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import type webpack from 'webpack';

export { extensions as defaultExtensions };

/**
 * @description Webpack [resolve.extensions](https://webpack.js.org/configuration/resolve/#resolveextensions)
 */
export const RESOLVE_EXTENSIONS_TOKEN = createToken<string[]>('tramvai webpack resolve extensions');

/**
 * @description Webpack [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvealias)
 */
export const RESOLVE_ALIAS_TOKEN = createToken<Record<string, string | false | string[]>>(
  'tramvai webpack resolve alias',
  { multi: true }
);

/**
 * @description Webpack [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvefallback)
 */
export const RESOLVE_FALLBACK_TOKEN = createToken<Record<string, string | false | string[]>>(
  'tramvai webpack resolve fallback',
  { multi: true }
);

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
