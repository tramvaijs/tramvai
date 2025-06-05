import path from 'node:path';
import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';

type AppFixtures = {
  app: StartCliResult;
  I: IAction;
};

type WorkerFixture = {
  targetApp: CreateApp.TargetApp;
  optionsApp: CreateApp.OptionsApp;
  settingApp: CreateApp.SettingApp;
  createApp: CreateApp.App;
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'integrity',
      cwd: path.resolve(__dirname, '../src'),
      config: {
        integrity: {
          enabled: true,
        },
        fileSystemPages: {
          enabled: true,
        },
        experiments: {
          runtimeChunk: 'single',
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  settingApp,
  createApp,
  I: IFixture,
});
