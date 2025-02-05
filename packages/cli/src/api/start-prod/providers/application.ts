import path from 'path';
import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import { fork } from 'child_process';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
  CONFIG_MANAGER_TOKEN,
  PORT_MANAGER_TOKEN,
  SELF_SIGNED_CERTIFICATE_TOKEN,
  STATIC_SERVER_TOKEN,
} from '../../../di/tokens';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';
import { CLOSE_HANDLER_TOKEN, SERVER_PROCESS_TOKEN } from '../tokens';
import { getDebugArg } from '../../../config/utils';
import { safeRequire } from '../../../utils/safeRequire';
import type { ConfigManager } from '../../../config/configManager';
import { createConfigManager } from '../../../config/configManager';
import { selfSignedCertificateProvider } from '../../shared/providers/selfSignedCertificateProvider';
import { createServer } from '../../start/utils/createServer';

export const applicationsProviders: readonly Provider[] = [
  ...selfSignedCertificateProvider,
  provide({
    provide: STATIC_SERVER_TOKEN,
    useFactory: ({ selfSignedCertificate }) => {
      return createServer(selfSignedCertificate);
    },
    deps: {
      selfSignedCertificate: {
        token: SELF_SIGNED_CERTIFICATE_TOKEN,
        optional: true,
      },
    },
  }),
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
    useFactory: ({ configManager, parameters, selfSignedCertificate }) => {
      const { env } = parameters;
      const serverConfigManager = (
        configManager as ConfigManager<ApplicationConfigEntry>
      ).withSettings({
        buildType: 'server',
      });
      const { debug, port, assetsPrefix, https } = serverConfigManager;
      const root = serverConfigManager.buildPath;
      return fork(path.resolve(root, 'server.js'), [], {
        execArgv: getDebugArg(debug),
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
          HOST: serverConfigManager.host,
          HTTPS: serverConfigManager.https
            ? JSON.stringify({
                key: selfSignedCertificate.keyPath,
                cert: selfSignedCertificate.certificatePath,
              })
            : null,
        },
      });
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
      parameters: COMMAND_PARAMETERS_TOKEN,
      selfSignedCertificate: SELF_SIGNED_CERTIFICATE_TOKEN,
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
