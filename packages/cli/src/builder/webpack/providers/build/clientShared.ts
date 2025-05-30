import type { Provider } from '@tinkoff/dippy';
import { optional } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import rimraf from 'rimraf';
import { CLI_PACKAGE_MANAGER, CLI_ROOT_DIR_TOKEN } from '../../../../di/tokens';
import { npmRequire } from '../../../../utils/npmRequire';
import { CLIENT_CONFIG_MANAGER_TOKEN, INIT_HANDLER_TOKEN } from '../../tokens';

export const buildClientSharedProviders: Provider[] = [
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager }) => {
      return function clearBuildDir() {
        return rimraf.sync(`${configManager.buildPath}/**`, {});
      };
    },
    deps: {
      configManager: optional(CLIENT_CONFIG_MANAGER_TOKEN),
    },
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager, rootDir, packageManager }) => {
      return async function prepareImageOptimization() {
        if (configManager.imageOptimization?.enabled) {
          await npmRequire({
            cliRootDir: rootDir,
            packageManager,
            packageName: 'image-webpack-loader',
            description: 'Устанавливаем зависимости для опции imageOptimization',
          });
        }
      };
    },
    deps: {
      configManager: optional(CLIENT_CONFIG_MANAGER_TOKEN),
      rootDir: CLI_ROOT_DIR_TOKEN,
      packageManager: CLI_PACKAGE_MANAGER,
    },
  }),
];
