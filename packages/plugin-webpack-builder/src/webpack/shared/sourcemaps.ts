import { createToken } from '@tinkoff/dippy';

/**
 * @description Webpack [Devtool](https://webpack.js.org/configuration/devtool/) option
 * @default false
 */
export const DEVTOOL_OPTIONS_TOKEN = createToken<
  false | 'eval' | 'eval-cheap-source-map' | 'eval-cheap-module-source-map' | 'eval-source-map'
>('tramvai webpack devtool option');
