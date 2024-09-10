import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import path from 'path';
import type { WorkerFixture } from '@playwright/test';
import type { StartCliOptions, StartCliResult } from '@tramvai/test-integration';
import { startCli } from '@tramvai/test-integration';
import type { AppTarget as _AppTarget } from './types';

export namespace StartAppTypes {
  export type TestApp = StartCliResult;
  export type StartOptions = StartCliOptions;
  export type AppTarget = _AppTarget;
}

/**
 * Фикстура запускает приложение с помощью метода `startCli` из `@tramvai/test-integration`
 * @param appTarget указывает какое приложение запускать (может как указывать на существующее приложение с tramvai.json конфигом так и принимать полный конфиг)
 * @param startOptions дополнительные параметры метода `startCli` (например env переменные для запущенного приложения)
 * @returns возвращает свойства приложения (например адрес запущенного сервера на локалхосте) и удобные тестовые методы (например обертки над papi и superagent)
 */
export const startAppFixture: [
  WorkerFixture<
    StartAppTypes.TestApp,
    { appTarget: StartAppTypes.AppTarget; startOptions: StartAppTypes.StartOptions }
  >,
  { scope: 'worker'; timeout: number }
] = [
  async ({ appTarget, startOptions }, use) => {
    let app: StartCliResult | undefined;

    try {
      app = await startCli(
        'target' in appTarget
          ? appTarget.target
          : mergeDeep(appTarget.config, {
              name: appTarget.name,
              type: 'application',
              root: appTarget.cwd,
            }),
        {
          ...startOptions,
          rootDir: appTarget.cwd ?? path.dirname(path.resolve(module.parent!.filename, '.')),
        }
      );

      await use(app);

      await app.close();
    } catch (error) {
      console.error(`startApp fixture failed:`, error);

      await app?.close();

      throw error;
    }
  },
  { scope: 'worker', timeout: 60000 },
];
