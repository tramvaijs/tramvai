import type { WorkerFixture } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { ApiServer } from './server-fixture';

export const optionsAppFixture: [
  WorkerFixture<CreateApp.OptionsApp, { apiServer: ApiServer }>,
  { scope: 'worker'; timeout: 60000; auto: true; option: true },
] = [
  async ({ apiServer }, use) => {
    const apiPort = apiServer.getPort();

    const envs = {
      TEST_API: `http://dns-test.invalid:${apiPort}/`,
      TEST_API_SEQ: `http://dns-seq-test.invalid:${apiPort}/`,
      DNS_LOOKUP_CACHE_ENABLE: 'true',
      DNS_LOOKUP_CACHE_TTL: '60000',
      DNS_LOOKUP_CACHE_LIMIT: '200',
    };

    await use({
      env: envs,
    });
  },
  { scope: 'worker', timeout: 60000, auto: true, option: true },
];
