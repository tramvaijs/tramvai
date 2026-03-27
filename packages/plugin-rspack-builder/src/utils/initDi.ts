import { initContainer, isValidModule, optional, provide } from '@tinkoff/dippy';
import {
  CONFIG_SERVICE_TOKEN,
  ConfigService,
  INPUT_PARAMETERS_TOKEN,
  Configuration,
  InputParameters,
  CONFIGURATION_EXTENSION_TOKEN,
} from '@tramvai/api/lib/config';
import type { ModuleType, ExtendedModule } from '@tinkoff/dippy';
import { BuildTarget, BuildType } from '@tramvai/plugin-base-builder/lib/types';
import { BUILD_MODE_TOKEN, BUILD_TARGET_TOKEN, BUILD_TYPE_TOKEN } from '../rspack/rspack-config';
import { RSPACK_TRANSPILER_TOKEN } from '../rspack/shared/transpiler';

export async function initDi(
  inputParameters: InputParameters,
  extraConfiguration: Partial<Configuration>,
  { type, target }: { type: BuildType; target: BuildTarget }
) {
  const config = new ConfigService(
    {
      mode: 'development',
      ...inputParameters,
    },
    extraConfiguration
  );
  await config.initialize();

  const plugins: Array<ModuleType | ExtendedModule> = config.plugins.map((plugin) => {
    if (typeof plugin === 'string') {
      const possibleModule = require(plugin).default;

      if (isValidModule(possibleModule)) {
        return possibleModule;
      }

      throw Error(
        `Plugin "${plugin}" is not a valid @tramvai/api module. Module should be created with "declareModule" method, and be exported as default`
      );
    }

    return plugin;
  });

  const di = initContainer({
    modules: plugins,
    providers: [
      provide({
        provide: CONFIG_SERVICE_TOKEN,
        useValue: config,
      }),
      provide({
        provide: INPUT_PARAMETERS_TOKEN,
        useValue: inputParameters,
      }),
      provide({
        provide: BUILD_TYPE_TOKEN,
        useValue: type,
      }),
      provide({
        provide: BUILD_TARGET_TOKEN,
        useValue: target,
      }),
      provide({
        provide: BUILD_MODE_TOKEN,
        useValue: 'development',
      }),
    ],
  });

  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN));
  if (!transpiler) {
    throw Error(
      `Transpiler not found, make sure you add "@tramvai/plugin-babel-transpiler" or "@tramvai/plugin-swc-transpiler" to tramvai config file`
    );
  }

  const configExtensions = di.get(optional(CONFIGURATION_EXTENSION_TOKEN));
  if (Array.isArray(configExtensions)) {
    config.loadExtensions(configExtensions);
  }

  return di;
}
