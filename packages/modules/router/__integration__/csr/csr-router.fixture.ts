import { test as base } from '@playwright/test';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import { BuildAppTypes } from '@tramvai/test-pw';
import {
  settingApp,
  app,
  CreateApp,
  createApp,
} from '@tramvai/internal-test-utils/fixtures/create-app';
import { ProxyServer, proxyHttpServerFixture } from './proxy-fixture';
import { RouterComponentObject, RouterFixture } from './router-fixture';

type ProxyApp = {
  port: number;
};

type AppFixtures = {
  app: CreateApp.App;
  I: IAction;
  appServer: BuildAppTypes.AppServer;
  proxyApp: ProxyApp;
  router: RouterComponentObject;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  optionsApp: CreateApp.OptionsApp | undefined;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.App;
  proxyServer: ProxyServer;
  proxyStaticServer: {} | undefined;
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'csr-router',
      cwd: __dirname,
      config: {
        fileSystemPages: {
          enabled: true,
          pagesDir: './csr-project/pages',
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [
    {
      fileCache: false,
      env: {
        TRAMVAI_FORCE_CLIENT_SIDE_RENDERING: 'true',
      },
    },
    { scope: 'worker', auto: true, option: true },
  ],
  createApp,
  settingApp,
  app,
  proxyServer: proxyHttpServerFixture,
  router: RouterFixture,
  I: IFixture,
});
