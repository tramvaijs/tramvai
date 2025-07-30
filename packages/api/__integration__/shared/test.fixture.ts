import { test as base } from '@playwright/test';
import { DevServer } from '../../src/builder/dev-server';
import { StartParameters, start } from '../../src/api/start';
import { Configuration } from '../../src/config';

type TestFixture = {
  devServer: DevServer;
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
});
