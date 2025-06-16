import { declareModule, provide } from '@tinkoff/dippy';
import {
  DEV_SERVER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
} from '@tramvai/api/lib/tokens';
import { CONFIG_SERVICE_TOKEN, INPUT_PARAMETERS_TOKEN } from '@tramvai/api/lib/config';
import { createDevServer } from './dev-server/dev-server';

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
  ],
});

// eslint-disable-next-line import/no-default-export
export default WebpackBuilderPlugin;
