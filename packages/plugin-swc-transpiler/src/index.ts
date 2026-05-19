import { declareModule, provide } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  WEBPACK_TRANSPILER_TOKEN,
  WebpackTranspilerInputParameters,
} from '@tramvai/plugin-webpack-builder/lib/webpack/shared/transpiler';
import {
  RSPACK_TRANSPILER_TOKEN,
  RspackTranspilerInputParameters,
} from '@tramvai/plugin-rspack-builder/lib/rspack/shared/transpiler';
import { configFactory } from './config-factory';

export const SwcTranspilerPlugin = declareModule({
  name: 'SwcTranspilerPlugin',
  providers: [
    provide({
      provide: WEBPACK_TRANSPILER_TOKEN,
      useFactory: ({ config }) => {
        return {
          name: 'swc',
          loader: 'swc-loader',
          configFactory: (parameters: WebpackTranspilerInputParameters) => {
            return configFactory(parameters);
          },
        };
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
      },
    }),
    provide({
      provide: RSPACK_TRANSPILER_TOKEN,
      useFactory: ({ config }) => {
        return {
          name: 'swc',
          loader: 'builtin:swc-loader',
          configFactory: (parameters: RspackTranspilerInputParameters) => {
            return configFactory(parameters);
          },
        };
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
      },
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default SwcTranspilerPlugin;
