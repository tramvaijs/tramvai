import path from 'node:path';
import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';

type AppFixtures = {
  app: StartCliResult;
  buildAllureTree: void;
  I: IAction;
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
      name: 'assets',
      cwd: path.resolve(__dirname, '../src'),
      config: {
        integrity: {
          enabled: true,
        },
        modern: false,
        fileSystemPages: {
          enabled: true,
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  settingApp,
  createApp,
  buildAllureTree,
  I: IFixture,
});
