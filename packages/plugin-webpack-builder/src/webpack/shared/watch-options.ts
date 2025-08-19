import { createToken } from '@tinkoff/dippy';

// TS-4023 error when importing WatchOptions from webpack
export interface WatchOptions {
  /**
   * Delay the rebuilt after the first change. Value is a time in ms.
   */
  aggregateTimeout?: number;

  /**
   * Resolve symlinks and watch symlink and real file. This is usually not needed as webpack already resolves symlinks ('resolve.symlinks').
   */
  followSymlinks?: boolean;

  /**
   * Ignore some files from watching (glob pattern or regexp).
   */
  ignored?: string | RegExp | string[];

  /**
   * Enable polling mode for watching.
   */
  poll?: number | boolean;

  /**
   * Stop watching when stdin stream has ended.
   */
  stdin?: boolean;
}

/**
 * @description Webpack [WatchOptions](https://webpack.js.org/configuration/watch/#watchoptions)
 */
export const WATCH_OPTIONS_TOKEN = createToken<WatchOptions>('tramvai webpack watch options');
