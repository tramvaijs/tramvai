import path from 'path';
import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import { fork } from 'child_process';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
  CONFIG_MANAGER_TOKEN,
  PORT_MANAGER_TOKEN,
} from '../../../di/tokens';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';
import { CLOSE_HANDLER_TOKEN, SERVER_PROCESS_TOKEN } from '../tokens';
import { DEBUG_ARGV } from '../../../config/constants';
import { safeRequire } from '../../../utils/safeRequire';
import type { ConfigManager } from '../../../config/configManager';
import { createConfigManager } from '../../../config/configManager';

export const applicationsProviders: readonly Provider[] = [
  provide({
    provide: CONFIG_MANAGER_TOKEN,
    useFactory: ({ configEntry, parameters, portManager }) =>
      createConfigManager(configEntry as ApplicationConfigEntry, {
        ...parameters,
        appEnv: parameters.env,
        env: 'production',
        buildType: 'client',
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
    provide: SERVER_PROCESS_TOKEN,
    useFactory: ({ configManager, parameters }) => {
      const { env } = parameters;
      const serverConfigManager = (
        configManager as ConfigManager<ApplicationConfigEntry>
      ).withSettings({
        buildType: 'server',
      });
      const { debug, port, assetsPrefix } = serverConfigManager;
      const root = serverConfigManager.buildPath;

      return fork(path.resolve(root, 'server.js'), [], {
        execArgv: debug ? DEBUG_ARGV : [],
        cwd: root,
        env: {
          ...safeRequire(path.resolve(process.cwd(), 'env.development'), true),
          ...safeRequire(path.resolve(process.cwd(), 'env'), true),
          ...env,
          ...process.env,
          NODE_ENV: 'production',
          TRAMVAI_CLI_COMMAND: 'start-prod',
          PORT: `${port}`,
          PORT_SERVER: `${port}`,
          ASSETS_PREFIX: assetsPrefix,
        },
      });
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
      parameters: COMMAND_PARAMETERS_TOKEN,
    },
  }),
  provide({
    provide: CLOSE_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ serverProcess }) => {
      return async () => {
        return new Promise<void>((resolve) => {
          serverProcess.once('exit', () => {
            resolve();
          });

          serverProcess.kill();
        });
      };
    },
    deps: {
      serverProcess: SERVER_PROCESS_TOKEN,
    },
  }),
] as const;
