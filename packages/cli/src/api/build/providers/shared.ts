import { provide } from '@tinkoff/dippy';
import type { Provider } from '@tinkoff/dippy';
import { nanoid } from 'nanoid';
import {
  CONFIG_MANAGER_TOKEN,
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
} from '../../../di/tokens';
import { createConfigManager } from '../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';
import { BUILD_ID_TOKEN } from '../../../builder/webpack/tokens';

export const sharedProviders: readonly Provider[] = [
  provide({
    provide: CONFIG_MANAGER_TOKEN,
    useFactory: ({ configEntry, parameters, buildId }) => {
      return createConfigManager(configEntry as ApplicationConfigEntry, {
        buildId,
        ...parameters,
        appEnv: parameters.env,
        env: 'production',
        buildType: 'client',
      });
    },
    deps: {
      configEntry: CONFIG_ENTRY_TOKEN,
      parameters: COMMAND_PARAMETERS_TOKEN,
      buildId: BUILD_ID_TOKEN,
    },
  }),
  provide({
    provide: BUILD_ID_TOKEN,
    useFactory: () => {
      return nanoid();
    },
  }),
];
