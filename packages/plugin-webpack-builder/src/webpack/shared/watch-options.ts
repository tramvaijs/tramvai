import { createToken } from '@tinkoff/dippy';

// TODO: TS4023, can't use webpack internal types
type WatchOptions = {
  aggregateTimeout?: number;
  followSymlinks?: boolean;
  ignored?: string | RegExp | string[];
  poll?: number | boolean;
};

/**
 * @description Webpack [WatchOptions](https://webpack.js.org/configuration/watch/#watchoptions)
 */
export const WATCH_OPTIONS_TOKEN = createToken<WatchOptions>('tramvai webpack watch options');
