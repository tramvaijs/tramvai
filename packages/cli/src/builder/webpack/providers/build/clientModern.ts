import type { Provider } from '@tinkoff/dippy';
import { DI_TOKEN, provide } from '@tinkoff/dippy';
import { CONFIG_MANAGER_TOKEN } from '../../../../di/tokens';
import { toWebpackConfig } from '../../../../library/webpack/utils/toWebpackConfig';
import {
  CLIENT_MODERN_CONFIG_MANAGER_TOKEN,
  CLOSE_HANDLER_TOKEN,
  PROCESS_HANDLER_TOKEN,
  WEBPACK_CLIENT_MODERN_COMPILER_TOKEN,
  WEBPACK_CLIENT_MODERN_CONFIG_TOKEN,
} from '../../tokens';
import { closeWebpack } from '../../utils/closeWebpack';
import { runWebpack } from '../../utils/runWebpack';
import { createCompiler } from '../../utils/compiler';

export const buildClientModernProviders: Provider[] = [
  provide({
    provide: CLIENT_MODERN_CONFIG_MANAGER_TOKEN,
    useFactory: ({ configManager }) => {
      return configManager.withSettings({
        buildType: 'client',
        modern: true,
      });
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: WEBPACK_CLIENT_MODERN_COMPILER_TOKEN,
    useFactory: ({ webpackConfig, di }) => {
      return createCompiler(toWebpackConfig(webpackConfig), di);
    },
    deps: {
      webpackConfig: WEBPACK_CLIENT_MODERN_CONFIG_TOKEN,
      di: DI_TOKEN,
    },
  }),
  provide({
    provide: PROCESS_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ webpackCompiler }) => {
      return function webpackBuild() {
        return runWebpack(webpackCompiler);
      };
    },
    deps: {
      webpackCompiler: WEBPACK_CLIENT_MODERN_COMPILER_TOKEN,
    },
  }),
  provide({
    provide: CLOSE_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ webpackCompiler }) => {
      return function webpackClose() {
        return closeWebpack(webpackCompiler);
      };
    },
    deps: {
      webpackCompiler: WEBPACK_CLIENT_MODERN_COMPILER_TOKEN,
    },
  }),
];
