import type { WorkerFixture } from '@playwright/test';
import { DevServer } from '../../src/builder/dev-server';
import { StartParameters, start } from '../../src/api/start';
import { Configuration } from '../../src/config';

// TODO: export from @tramvai/api as public API
export const devServerFixture: [
  WorkerFixture<
    DevServer,
    { inputParameters: StartParameters; extraConfiguration: Partial<Configuration> }
  >,
  { scope: 'worker'; timeout: number },
] = [
  async ({ inputParameters, extraConfiguration }, use) => {
    process.env.TRAMVAI_COMPILE_CACHE_DISABLED = 'true';

    const devServer = await start(inputParameters, extraConfiguration);

    await use(devServer);

    await devServer.close();
  },
  { scope: 'worker', timeout: 30000 },
];
