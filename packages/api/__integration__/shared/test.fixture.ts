import { spawn } from 'node:child_process';
import { test as base } from '@playwright/test';
import { DevServer } from '../../src/builder/dev-server';
import { StartParameters, start } from '../../src/api/start';
import { Configuration } from '../../src/config';

type TestFixture = {
  devServer: DevServer;
  spawnDevServer: { logs: string[] };
  inputParameters: StartParameters;
  extraConfiguration: Partial<Configuration>;
};

type WorkerFixture = {};

export const test = base.extend<TestFixture, WorkerFixture>({
  inputParameters: [
    {
      name: 'default',
    },
    { option: true },
  ],
  extraConfiguration: [{}, { option: true }],
  devServer: async ({ inputParameters, extraConfiguration }, use) => {
    process.env.TRAMVAI_COMPILE_CACHE_DISABLED = 'true';

    const devServer = await start(inputParameters, extraConfiguration);

    await use(devServer);

    await devServer.close();
  },
  spawnDevServer: async ({ inputParameters, extraConfiguration }, use) => {
    const code = `
  async function main() {
  const { start } = require('@tramvai/api/lib/api/start');

  const devServer = await start(${JSON.stringify(inputParameters)}, ${JSON.stringify(extraConfiguration)});
  
  await devServer.buildPromise;

  await devServer.close();
  }

  main()
  `;

    const logs: string[] = [];
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['-e', code], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      child.stdout.on('data', (data) => {
        logs.push(data.toString());
      });

      child.stderr.on('data', (data) => {
        logs.push(data.toString());
      });

      child.on('close', () => {
        resolve(undefined);
      });
    });

    use({ logs });
  },
});
