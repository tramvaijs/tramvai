import { createToken } from '@tinkoff/dippy';

/**
 * @description Webpack [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) options
 * @description Rspack [DefinePlugin](https://rspack.rs/plugins/webpack/define-plugin) options
 */
export const DEFINE_PLUGIN_OPTIONS_TOKEN = createToken<Record<string, any>>(
  'tramvai build define plugin options',
  { multi: true }
);
