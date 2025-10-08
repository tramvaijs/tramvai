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

type ProxyApp = {
  port: number;
};

type AppFixtures = {
  app: CreateApp.App;
  I: IAction;
  appServer: BuildAppTypes.AppServer;
  proxyApp: ProxyApp;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  optionsApp: CreateApp.OptionsApp | undefined;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.App;
  proxyStaticServer: {} | undefined;
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'request-metrics',
      cwd: __dirname,
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  settingApp,
  createApp,
  app,
  I: IFixture,
});
