import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import { dirname, resolve } from 'path';

type AppFixtures = {
  app: StartCliResult;
  buildAllureTree: void;
};

type WorkerFixture = {
  targetApp: CreateApp.TargetApp;
  optionsApp: CreateApp.OptionsApp;
  settingApp: CreateApp.SettingApp;
  createApp: CreateApp.CreateCustomApp;
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'etag-app',
      cwd: resolve(dirname(module.parent!.filename), 'etag'),
      config: {},
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  buildAllureTree,
});

export const testWeak = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'etag-app',
      cwd: resolve(dirname(module.parent!.filename), 'etag'),
      config: {},
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [
    {
      env: {
        WEAK_ETAG: 'true',
      },
    },
    { scope: 'worker', auto: true, option: true },
  ],
  app,
  buildAllureTree,
});
