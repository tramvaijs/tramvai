import { createToken } from '@tinkoff/dippy';
import type { RspackPluginInstance } from '@rspack/core';
import type { WebpackPluginInstance } from 'webpack';

/**
 * @description Rspack plugins option
 */
export const RSPACK_PLUGINS_TOKEN = createToken<RspackPluginInstance[] | RspackPluginInstance>(
  'tramvai rspack plugins option',
  { multi: true }
);

/**
 * @description Webpack plugins option
 */
export const WEBPACK_PLUGINS_TOKEN = createToken<WebpackPluginInstance[] | WebpackPluginInstance>(
  'tramvai webpack plugins option',
  { multi: true }
);
