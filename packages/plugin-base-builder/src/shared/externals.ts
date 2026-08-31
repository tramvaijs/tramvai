import { createToken } from '@tinkoff/dippy';
import { Externals } from 'webpack';

/**
 * @description Webpack [Externals](https://webpack.js.org/configuration/externals/) options.
 * @description Rspack [Externals](https://rspack.rs/config/externals) options.
 * Will be processed as RegExp
 */
export const BUILD_EXTERNALS_TOKEN = createToken<Externals>('tramvai webpack externals', {
  multi: true,
});
