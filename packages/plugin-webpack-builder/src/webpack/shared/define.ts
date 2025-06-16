import { createToken } from '@tinkoff/dippy';

// TODO: TS4023, can't use webpack internal types
/**
 * @description Webpack [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) options
 */
export const DEFINE_PLUGIN_OPTIONS_TOKEN = createToken<Record<string, any>>(
  'tramvai webpack define plugin options',
  { multi: true }
);
