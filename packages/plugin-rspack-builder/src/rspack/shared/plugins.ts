import { createToken } from '@tinkoff/dippy';
import type { RspackPluginInstance } from '@rspack/core';

/**
 * @description Rspack plugins option
 */
export const RSPACK_PLUGINS_TOKEN = createToken<RspackPluginInstance[] | RspackPluginInstance>(
  'tramvai rspack plugins option',
  { multi: true }
);
