import type { TestFixture } from '@playwright/test';
import { test as base } from '@playwright/test';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { ModuleTramvai } from '@tramvai/internal-test-utils/fixtures/tramvai';
import { TramvaiFixture } from '@tramvai/internal-test-utils/fixtures/tramvai';
import sharedEnv from '@tramvai/internal-test-utils/env';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { BuildAppTypes } from '@tramvai/test-pw';
import { buildAppFixture, appServerFixture } from '@tramvai/test-pw';
import httpProxy from 'http-proxy';

type AppFixtures = {
  appServer: BuildAppTypes.AppServer;
  proxyApp: ProxyApp;
  I: IAction;
  tramvai: ModuleTramvai;
};

type WorkerFixture = {
  appTarget: BuildAppTypes.AppTarget;
  buildOptions: BuildAppTypes.BuildOptions;
  buildApp: void;
  appServerOptions: BuildAppTypes.AppServerOptions;
  proxyAppOptions: ProxyApp;
};

type ProxyApp = {
  port: number;
};

const proxyAppFixture: [
  TestFixture<ProxyApp, { proxyAppOptions: ProxyApp; appServer: BuildAppTypes.AppServer }>,
  { scope: 'test' }
] = [
  async ({ proxyAppOptions, appServer }, use) => {
    const proxy = httpProxy.createProxyServer({
      target: {
        host: 'localhost',
        port: appServer.staticPort,
      },
    });

    proxy.listen(proxyAppOptions.port);

    const app = {
      port: proxyAppOptions.port,
    };

    await use(app);

    proxy.close();
  },
  { scope: 'test' },
];

const defaultEnv = { ...sharedEnv };
delete defaultEnv.NODE_ENV;
delete defaultEnv.ASSETS_PREFIX;

export const test = base.extend<AppFixtures, WorkerFixture>({
  appTarget: [
    {
      name: 'assets-prefix',
      cwd: __dirname,
    },
    { scope: 'worker', auto: true },
  ],
  buildApp: buildAppFixture,
  buildOptions: [{}, { scope: 'worker', auto: true, option: true }],
  appServer: appServerFixture,
  appServerOptions: [
    async ({ proxyAppOptions }, use) => {
      await use({
        env: {
          ...defaultEnv,
          PROXY_ASSETS_PREFIX: `http://localhost:${proxyAppOptions.port}/dist/client/`,
        },
      });
    },
    { scope: 'worker', auto: true, option: true },
  ],
  proxyApp: proxyAppFixture,
  proxyAppOptions: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const port = await getPort();

      await use({ port });
    },
    { scope: 'worker', auto: true, option: true },
  ],
  I: IFixture,
  tramvai: TramvaiFixture,
});
