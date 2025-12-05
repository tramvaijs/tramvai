import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import path from 'path';
import { node } from 'execa';
import waitOn from 'wait-on';
import getPort from 'get-port';
import type { WorkerFixture, TestFixture } from '@playwright/test';
import type { BuildCliOptions } from '@tramvai/test-integration';
import { buildCli } from '@tramvai/test-integration';
import type { AppTarget as _AppTarget } from './types';

export type AppServerType = {
  port: number;
  staticPort: number;
  stdout: string[];
  stderr: string[];
};
export type AppServerOptionsType = {
  env?: Record<string, string>;
  // @todo read from tramvai.json
  output?: {
    client?: string;
    server?: string;
  };
};

export namespace BuildAppTypes {
  export type Cwd = string;
  export type AppTarget = _AppTarget;
  export type BuildOptions = BuildCliOptions;
  export type AppServer = AppServerType;
  export type AppServerOptions = AppServerOptionsType;
}

/**
 * Фикстура запускает сборку приложения с помощью метода `buildCli` из `@tramvai/test-integration`
 * @param appTarget указывает какое приложение запускать (может как указывать на существующее приложение с tramvai.json конфигом так и принимать полный конфиг)
 * @param buildOptions дополнительные параметры метода `buildCli` (например билдтайм env переменные)
 */
export const buildAppFixture: [
  WorkerFixture<
    void,
    {
      appTarget: BuildAppTypes.AppTarget;
      buildOptions?: BuildAppTypes.BuildOptions;
    }
  >,
  { scope: 'worker'; timeout: number },
] = [
  async ({ appTarget, buildOptions }, use) => {
    await buildCli(
      'target' in appTarget
        ? appTarget.target
        : mergeDeep(appTarget.config, {
            name: appTarget.name,
            type: 'application',
            root: appTarget.cwd,
          }),
      {
        ...buildOptions,
        rootDir: appTarget.cwd ?? path.dirname(path.resolve(module.parent!.filename, '.')),
      }
    );

    await use();

    // @todo clear dist?
  },
  { scope: 'worker', timeout: 60000 },
];

/**
 * Фикстура запускает собранное с помощью `buildAppFixture` приложение (а именно server.js)
 * @param appTarget указывает какое приложение запускать (может как указывать на существующее приложение с tramvai.json конфигом так и принимать полный конфиг)
 * @param appServerOptions дополнительные параметры для приложения (например рантайм env переменные)
 * @returns возвращает свойства запущенного сервера (порт приложения, порт по которому доступны ассеты)
 */
export const appServerFixture: [
  TestFixture<
    BuildAppTypes.AppServer,
    {
      appTarget: BuildAppTypes.AppTarget;
      appServerOptions: BuildAppTypes.AppServerOptions;
      buildApp: void;
    }
  >,
  { scope: 'test' },
] = [
  async ({ appTarget, appServerOptions, buildApp }, use) => {
    const { env = {}, output = {} } = appServerOptions;
    const root = appTarget.cwd ?? path.dirname(path.resolve(module.parent!.filename, '.'));
    const port = await getPort();
    const staticPort = await getPort();
    const readinessProbePath = `http://localhost:${port}/readyz`;
    const clientOutput = output.client ?? path.join('dist', 'client');
    const serverOutput = output.server ?? path.join('dist', 'server');

    const server = node(path.resolve(root, serverOutput, 'server.js'), [], {
      cwd: root,
      env: {
        PORT: String(port),
        PORT_STATIC: String(staticPort),
        NODE_ENV: 'production',
        CACHE_WARMUP_DISABLED: 'true',
        DEV_STATIC: 'true',
        DANGEROUS_UNSAFE_ENV_FILES: 'true',
        ASSETS_PREFIX: `http://localhost:${staticPort}/${clientOutput}/`,
        ...env,
      },
    });

    const stdout: string[] = [];
    const stderr: string[] = [];

    server.stdout?.on('data', (chunk: any) => {
      const log = chunk.toString();
      stdout.push(...log.split('\n'));
    });

    server.stderr?.on('data', (chunk: any) => {
      const log = chunk.toString();
      stderr.push(...log.split('\n'));
    });

    // playwright can only collect string-form stdio into the test report
    // https://github.com/microsoft/playwright/issues/23993
    server.stdout?.setEncoding('utf-8');
    server.stderr?.setEncoding('utf-8');

    // @todo pipe only when server run is failed
    server.stdout?.pipe(process.stdout);
    server.stderr?.pipe(process.stderr);

    await Promise.race([
      server,
      waitOn({
        resources: [readinessProbePath],
        delay: 100,
        interval: 100,
        timeout: 5 * 1000,
        validateStatus: (status: number) => status === 200,
      }),
    ]);

    const app: BuildAppTypes.AppServer = {
      port,
      staticPort,
      stdout,
      stderr,
    };

    await use(app);

    server.kill('SIGKILL');
  },
  { scope: 'test' },
];
