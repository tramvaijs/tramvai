import { createToken } from '@tinkoff/dippy';
import { extensions } from '@tramvai/api/lib/config';
import type { Configuration as WebpackConfiguration } from 'webpack';

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
