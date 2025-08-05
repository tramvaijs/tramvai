import { createToken } from '@tinkoff/dippy';

// TODO: TS4023, can't use webpack internal types
/**
 * @description Webpack [Externals](https://webpack.js.org/configuration/externals/) options.
 * Will be processed as RegExp
 */
export const WEBPACK_EXTERNALS_TOKEN = createToken<string[]>('tramvai webpack externals', {
  multi: true,
});
