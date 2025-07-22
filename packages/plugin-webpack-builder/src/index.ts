import { declareModule, provide } from '@tinkoff/dippy';
import {
  DEV_SERVER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
} from '@tramvai/api/lib/tokens';
import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  Extension,
  INPUT_PARAMETERS_TOKEN,
} from '@tramvai/api/lib/config';
import { createDevServer } from './dev-server/dev-server';

export { PolyfillConditionPlugin } from './webpack/plugins/polyfill-condition-plugin';
export { BUILD_TYPE_TOKEN, BUILD_MODE_TOKEN } from './webpack/webpack-config';
export {
  WEBPACK_TRANSPILER_TOKEN,
  WebpackTranspiler,
  WebpackTranspilerInputParameters,
} from './webpack/shared/transpiler';
export { DEFINE_PLUGIN_OPTIONS_TOKEN } from './webpack/shared/define';
export { DEVTOOL_OPTIONS_TOKEN } from './webpack/shared/sourcemaps';
export { WATCH_OPTIONS_TOKEN } from './webpack/shared/watch-options';
export { RESOLVE_EXTENSIONS } from './webpack/shared/resolve';

/**
 * @title Configure the options on webpack splitChunks
 * @default {}
 */
export type SplitChunksConfig = {
  /**
   * @default "granularChunks"
   */
  mode?: 'granularChunks' | false;
  /**
   * @title Move tramvai packages into a separate chunk
   * @default true
   */
  frameworkChunk?: boolean;
  /**
   * @title Move module to shared chunk if used at least as many times in other chunks
   * @default 2
   */
  granularChunksSplitNumber?: number;
  /**
   * @title Minimum shared chunk size in bytes
   * @default 20000
   */
  granularChunksMinSize?: number;
};

const splitChunksConfigExtension = {
  splitChunks: ({ project }: Parameters<Extension<any>>[0]): SplitChunksConfig | undefined => {
    if (project.type === 'child-app') {
      return undefined;
    }

    const {
      mode = 'granularChunks',
      frameworkChunk = true,
      granularChunksSplitNumber = 2,
      granularChunksMinSize = 20000,
    } = project.splitChunks ?? {};

    return {
      mode,
      frameworkChunk,
      granularChunksSplitNumber,
      granularChunksMinSize,
    } satisfies SplitChunksConfig;
  },
};

type SplitChunksConfigExtensionType = typeof splitChunksConfigExtension;

declare module '@tramvai/api/lib/config' {
  export interface ApplicationProject {
    splitChunks?: SplitChunksConfig;
  }
  export interface ConfigurationExtensions extends SplitChunksConfigExtensionType {}
}

export const WebpackBuilderPlugin = declareModule({
  name: 'WebpackBuilderPlugin',
  providers: [
    provide({
      provide: DEV_SERVER_TOKEN,
      useFactory: createDevServer,
      deps: {
        inputParameters: INPUT_PARAMETERS_TOKEN,
        portManager: PORT_MANAGER_TOKEN,
        config: CONFIG_SERVICE_TOKEN,
        tracer: TRACER_TOKEN,
        closeHandlers: DEV_SERVER_CLOSE_HANDLER_TOKEN,
      },
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: splitChunksConfigExtension,
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default WebpackBuilderPlugin;
