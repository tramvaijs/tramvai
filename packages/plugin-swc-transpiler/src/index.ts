import { declareModule, provide } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import {
  WEBPACK_TRANSPILER_TOKEN,
  WebpackTranspilerInputParameters,
} from '@tramvai/plugin-webpack-builder';
import { configFactory } from './config-factory';

export const SwcTranspilerPlugin = declareModule({
  name: 'SwcTranspilerPlugin',
  providers: [
    provide({
      provide: WEBPACK_TRANSPILER_TOKEN,
      useFactory: ({ config }) => {
        return {
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
  ],
});

// eslint-disable-next-line import/no-default-export
export default SwcTranspilerPlugin;
