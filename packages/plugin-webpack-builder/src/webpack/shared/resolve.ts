import { createToken } from '@tinkoff/dippy';
import { extensions } from '@tramvai/api/lib/config';

export { extensions as defaultExtensions };

/**
 * @description Webpack [resolve.extensions](https://webpack.js.org/configuration/resolve/#resolveextensions)
 */
export const RESOLVE_EXTENSIONS = createToken<string[]>('tramvai webpack resolve extensions');
