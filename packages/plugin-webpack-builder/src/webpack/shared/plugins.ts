import { createToken } from '@tinkoff/dippy';
import type { WebpackPluginInstance } from 'webpack';

/**
 * @description Webpack plugins option
 */
export const WEBPACK_PLUGINS_TOKEN = createToken<WebpackPluginInstance[] | WebpackPluginInstance>(
  'tramvai webpack plugins option',
  { multi: true }
);
