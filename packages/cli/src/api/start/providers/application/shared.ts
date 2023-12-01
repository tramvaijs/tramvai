import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';

import { CLOSE_HANDLER_TOKEN, INIT_HANDLER_TOKEN } from '../../tokens';
import {
  CONFIG_MANAGER_TOKEN,
  CONFIG_ENTRY_TOKEN,
  COMMAND_PARAMETERS_TOKEN,
  STATIC_SERVER_TOKEN,
  PORT_MANAGER_TOKEN,
} from '../../../../di/tokens';
import { stopServer } from '../../utils/stopServer';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';
import { createConfigManager } from '../../../../config/configManager';
import { createServer } from '../../utils/createServer';
import { listenServer } from '../../utils/listenServer';

export const sharedProviders: readonly Provider[] = [
  provide({
    provide: CONFIG_MANAGER_TOKEN,
    useFactory: ({ configEntry, parameters, portManager }) =>
      createConfigManager(configEntry as ApplicationConfigEntry, {
        ...parameters,
        appEnv: parameters.env,
        env: 'development',
        port: portManager.port,
        staticPort: portManager.staticPort,
      }),
    deps: {
      configEntry: CONFIG_ENTRY_TOKEN,
      parameters: COMMAND_PARAMETERS_TOKEN,
      portManager: PORT_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: STATIC_SERVER_TOKEN,
    useFactory: createServer,
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager, staticServer }) => {
      return async function staticServerListen() {
        const { staticHost, staticPort } = configManager;

        await listenServer(staticServer, staticHost.replace('localhost', '0.0.0.0'), staticPort);
      };
    },
    deps: {
      staticServer: STATIC_SERVER_TOKEN,
      configManager: CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CLOSE_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ staticServer, portManager }) => {
      return async () => {
        await portManager.cleanup();
        return stopServer(staticServer);
      };
    },
    deps: {
      staticServer: STATIC_SERVER_TOKEN,
      portManager: PORT_MANAGER_TOKEN,
    },
  }),
] as const;
