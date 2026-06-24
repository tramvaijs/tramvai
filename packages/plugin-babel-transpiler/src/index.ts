import { declareModule, provide } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import type { TranspilerInputParameters } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import {
  WEBPACK_TRANSPILER_TOKEN,
  RSPACK_TRANSPILER_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/transpiler';

import { configFactory } from './config-factory';

export const BabelTranspilerPlugin = declareModule({
  name: 'BabelTranspilerPlugin',
  providers: [
    provide({
      provide: WEBPACK_TRANSPILER_TOKEN,
      useFactory: ({ config }) => {
        return {
          name: 'babel',
          loader: 'babel-loader',
          configFactory: (parameters: TranspilerInputParameters) => {
            return configFactory(parameters);
          },
          useThreadLoader:
            process.env.TRAMVAI_DISABLE_THREAD_LOADER === 'true'
              ? false
              : // TODO: maybe just a config parameter?
                !!process.env.TRAMVAI_DEBUG_THREAD_LOADER ||
                (!config.debug && !process.env.TRAMVAI_CPU_PROFILE),
          // TODO: research, when warmup really useful?
          // can't find a big difference on a small project with one thread-loader worker
          // TODO: maybe just a config parameter?
          warmupThreadLoader: process.env.TRAMVAI_THREAD_LOADER_WARMUP_DISABLED !== 'true',
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
          name: 'babel',
          loader: 'babel-loader',
          configFactory: (parameters: TranspilerInputParameters) => {
            return configFactory(parameters);
          },
          useThreadLoader: false,
          warmupThreadLoader: false,
        };
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
      },
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default BabelTranspilerPlugin;
