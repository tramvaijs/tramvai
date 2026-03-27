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
  INPUT_PARAMETERS_TOKEN,
} from '@tramvai/api/lib/config';
import {
  runtimeChunkExtension,
  splitChunksConfigExtension,
  configExtension,
} from '@tramvai/plugin-base-builder';
import {
  SELF_SIGNED_CERTIFICATE_TOKEN,
  createSelfSignedCertificate,
} from '@tramvai/plugin-base-builder/lib/utils/selfSignedCertificate';

import { createDevServer } from './dev-server/dev-server';

export { BUILD_TYPE_TOKEN, BUILD_MODE_TOKEN } from './rspack/rspack-config';
export {
  RSPACK_TRANSPILER_TOKEN,
  RspackTranspiler,
  RspackTranspilerInputParameters,
} from './rspack/shared/transpiler';

export { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
export { BUILD_EXTERNALS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/externals';
export { PROVIDE_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/provide';
export {
  RESOLVE_EXTENSIONS_TOKEN,
  RESOLVE_ALIAS_TOKEN,
  RESOLVE_FALLBACK_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/resolve';
export { CACHE_ADDITIONAL_FLAGS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/cache';
export { STATS_FILE_NAME } from '@tramvai/plugin-base-builder/lib/shared/stats';

export const RspackBuilderPlugin = declareModule({
  name: 'RspackBuilderPlugin',
  providers: [
    provide({
      provide: DEV_SERVER_TOKEN,
      useFactory: createDevServer,
      deps: {
        inputParameters: INPUT_PARAMETERS_TOKEN,
        portManager: PORT_MANAGER_TOKEN,
        config: CONFIG_SERVICE_TOKEN,
        selfSignedCertificate: SELF_SIGNED_CERTIFICATE_TOKEN,
        tracer: TRACER_TOKEN,
        closeHandlers: DEV_SERVER_CLOSE_HANDLER_TOKEN,
      },
    }),
    provide({
      provide: SELF_SIGNED_CERTIFICATE_TOKEN,
      useFactory: ({ configManager, parameters }) => {
        const { host } = configManager;
        if (configManager.httpProtocol === 'https') {
          return createSelfSignedCertificate({
            host,
            certificatePath: parameters?.httpsCert,
            keyPath: parameters?.httpsKey,
          });
        }
        return null;
      },
      deps: {
        configManager: CONFIG_SERVICE_TOKEN,
        parameters: INPUT_PARAMETERS_TOKEN,
      },
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: splitChunksConfigExtension,
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: configExtension,
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: runtimeChunkExtension,
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default RspackBuilderPlugin;
