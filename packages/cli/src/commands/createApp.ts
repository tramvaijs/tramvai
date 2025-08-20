import type { Provider } from '@tinkoff/dippy';
import { createChildContainer } from '@tinkoff/dippy';
import { initRootContainer } from '../di/root';
import {
  builderProviders,
  commandsProviders,
  configProviders,
  packageManagerProviders,
  stdProviders,
  networkProviders,
} from '../di/providers';
import { COMMAND_MAP_TOKEN, COMMAND_PARAMETERS_TOKEN, COMMAND_RUNNER_TOKEN } from '../di/tokens';

export const createApp = ({
  commands,
  providers,
}: {
  commands: typeof COMMAND_MAP_TOKEN;
  providers: Provider[];
}): typeof COMMAND_RUNNER_TOKEN => {
  const rootContainer = initRootContainer([
    ...stdProviders,
    ...configProviders,
    ...commandsProviders,
    ...packageManagerProviders,
    ...builderProviders,
    ...networkProviders,
    ...providers,
    {
      provide: COMMAND_PARAMETERS_TOKEN,
      useValue: {},
    },
    {
      provide: COMMAND_MAP_TOKEN,
      useValue: commands,
    },
  ]);

  return {
    run(commandName, parameters, overridingProviders = []) {
      return createChildContainer(rootContainer, overridingProviders)
        .get(COMMAND_RUNNER_TOKEN)
        .run(commandName, parameters, []);
    },
  };
};
