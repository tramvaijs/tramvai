import type { Provider } from '@tinkoff/dippy';
import { DI_TOKEN, provide } from '@tinkoff/dippy';
import rimraf from 'rimraf';
import { toWebpackConfig } from '../../../../library/webpack/utils/toWebpackConfig';
import {
  CLOSE_HANDLER_TOKEN,
  INIT_HANDLER_TOKEN,
  PROCESS_HANDLER_TOKEN,
  SERVER_CONFIG_MANAGER_TOKEN,
  WEBPACK_SERVER_COMPILER_TOKEN,
  WEBPACK_SERVER_CONFIG_TOKEN,
} from '../../tokens';
import { closeWebpack } from '../../utils/closeWebpack';
import { runWebpack } from '../../utils/runWebpack';
import { createCompiler } from '../../utils/compiler';

export const buildServerProviders: Provider[] = [
  provide({
    provide: WEBPACK_SERVER_COMPILER_TOKEN,
    useFactory: ({ webpackConfig, di }) => {
      return createCompiler(toWebpackConfig(webpackConfig), di);
    },
    deps: {
      webpackConfig: WEBPACK_SERVER_CONFIG_TOKEN,
      di: DI_TOKEN,
    },
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager }) => {
      return function clearBuildDir() {
        return rimraf.sync(`${configManager.buildPath}/**`, {});
      };
    },
    deps: {
      configManager: SERVER_CONFIG_MANAGER_TOKEN,
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
      webpackCompiler: WEBPACK_SERVER_COMPILER_TOKEN,
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
      webpackCompiler: WEBPACK_SERVER_COMPILER_TOKEN,
    },
  }),
];
