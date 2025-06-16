import { createToken } from '@tinkoff/dippy';

// TODO: move to @tramvai/api?
export const defaultExtensions = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * @description Webpack [resolve.extensions](https://webpack.js.org/configuration/resolve/#resolveextensions)
 */
export const RESOLVE_EXTENSIONS = createToken<string[]>('tramvai webpack resolve extensions');
