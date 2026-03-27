import { extensions } from '@tramvai/api/lib/config';
import { createToken } from '@tinkoff/dippy';

export { extensions as defaultExtensions };

/**
 * @description Webpack [resolve.extensions](https://webpack.js.org/configuration/resolve/#resolveextensions)
 * @description Rspack [resolve.extensions](https://rspack.rs/config/resolve#resolveextensions)
 */
export const RESOLVE_EXTENSIONS_TOKEN = createToken<string[]>('tramvai build resolve extensions');

/**
 * @description Webpack [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvealias)
 * @description Rspack [resolve.alias](https://rspack.rs/config/resolve#resolvealias)
 */
export const RESOLVE_ALIAS_TOKEN = createToken<Record<string, string | false | string[]>>(
  'tramvai build resolve alias',
  { multi: true }
);

/**
 * @description Webpack [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvefallback)
 * @description Rspack [resolve.fallback](https://rspack.rs/config/resolve#resolvefallback)
 */
export const RESOLVE_FALLBACK_TOKEN = createToken<Record<string, string | false | string[]>>(
  'tramvai build resolve fallback',
  { multi: true }
);
