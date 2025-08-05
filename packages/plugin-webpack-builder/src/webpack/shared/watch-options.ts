import { createToken } from '@tinkoff/dippy';
import type { Watching } from 'webpack';

/**
 * @description Webpack [WatchOptions](https://webpack.js.org/configuration/watch/#watchoptions)
 */
export const WATCH_OPTIONS_TOKEN = createToken<Watching['watchOptions']>(
  'tramvai webpack watch options'
);
