import { createToken } from '@tinkoff/dippy';

/**
 * @description Webpack [provide plugin](https://webpack.js.org/plugins/provide-plugin/)
 */
export const PROVIDE_TOKEN = createToken<Record<string, string | string[]>>(
  'tramvai webpack provide',
  {
    multi: true,
  }
);
