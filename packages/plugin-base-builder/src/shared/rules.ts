import { createToken } from '@tinkoff/dippy';
import { RuleSetRule } from 'webpack';

/**
 * @description Webpack [rules](https://webpack.js.org/configuration/module/)
 * @description Rspack [rules](https://rspack.rs/config/module-rules)
 */
export const RULES_TOKEN = createToken<RuleSetRule>('tramvai build rules provide', {
  multi: true,
});
