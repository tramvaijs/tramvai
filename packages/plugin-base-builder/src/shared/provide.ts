import { createToken } from '@tinkoff/dippy';
import type { ProvidePluginOptions } from '@rspack/core';

/**
 * @description Webpack [provide plugin](https://webpack.js.org/plugins/provide-plugin/)
 * @description Rspack [provide plugin](https://rspack.rs/plugins/webpack/provide-plugin)
 */
export const PROVIDE_TOKEN = createToken<ProvidePluginOptions>('tramvai build provide', {
  multi: true,
});
