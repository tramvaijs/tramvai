import type { WorkerFixture } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { ApiServer, ProxyServer } from './server-fixture';

export const optionsAppFixture: [
  WorkerFixture<CreateApp.OptionsApp, { proxyServer: ProxyServer; apiServer: ApiServer }>,
  { scope: 'worker'; timeout: 60000; auto: true; option: true },
] = [
  async ({ proxyServer, apiServer }, use) => {
    const proxy = `http://127.0.0.1:${proxyServer.getPort()}`;
    const noProxy = `localhost,127.0.0.1,non-proxied.mylocalhost.com`;
    const apiPort = apiServer.getPort();

    const envs = {
      https_proxy: proxy,
      HTTPS_PROXY: proxy,
      no_proxy: noProxy,
      NO_PROXY: noProxy,
      FIRST_API: `https://proxied.mylocalhost.com:${apiPort}/`,
      SECOND_API: `https://non-proxied.mylocalhost.com:${apiPort}/`,
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    };

    process.env = {
      ...process.env,
      ...envs,
    };

    await use({
      env: envs,
    });
  },
  { scope: 'worker', timeout: 60000, auto: true, option: true },
];
