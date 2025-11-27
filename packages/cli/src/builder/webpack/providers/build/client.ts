import type { Provider } from '@tinkoff/dippy';
import { DI_TOKEN, provide } from '@tinkoff/dippy';
import { COMMAND_PARAMETERS_TOKEN, CONFIG_MANAGER_TOKEN } from '../../../../di/tokens';
import { toWebpackConfig } from '../../../../library/webpack/utils/toWebpackConfig';
import {
  CLIENT_CONFIG_MANAGER_TOKEN,
  CLOSE_HANDLER_TOKEN,
  PROCESS_HANDLER_TOKEN,
  WEBPACK_ANALYZE_PLUGIN_TOKEN,
  WEBPACK_CLIENT_COMPILER_TOKEN,
  WEBPACK_CLIENT_CONFIG_TOKEN,
} from '../../tokens';
import { closeWebpack } from '../../utils/closeWebpack';
import { runWebpack } from '../../utils/runWebpack';
import { createCompiler } from '../../utils/compiler';

export const buildClientProviders: Provider[] = [
  provide({
    provide: CLIENT_CONFIG_MANAGER_TOKEN,
    useFactory: ({ configManager }) => {
      return configManager.withSettings({
        buildType: 'client',
      });
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: WEBPACK_CLIENT_COMPILER_TOKEN,
    useFactory: ({ webpackConfig, di, analyzePlugin }) => {
      return createCompiler(
        toWebpackConfig(analyzePlugin ? analyzePlugin.patchConfig(webpackConfig) : webpackConfig),
        di
      );
    },
    deps: {
      webpackConfig: WEBPACK_CLIENT_CONFIG_TOKEN,
      di: DI_TOKEN,
      analyzePlugin: { token: WEBPACK_ANALYZE_PLUGIN_TOKEN, optional: true },
    },
  }),
  provide({
    provide: PROCESS_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ webpackCompiler, configManager }) => {
      return function webpackBuild() {
        return runWebpack(webpackCompiler, { verboseWebpack: configManager.verboseWebpack });
      };
    },
    deps: {
      webpackCompiler: WEBPACK_CLIENT_COMPILER_TOKEN,
      configManager: COMMAND_PARAMETERS_TOKEN,
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
      webpackCompiler: WEBPACK_CLIENT_COMPILER_TOKEN,
    },
  }),
];
