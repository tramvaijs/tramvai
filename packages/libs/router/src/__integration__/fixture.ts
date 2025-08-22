import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { app, createApp, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { StartCliResult } from '@tramvai/test-integration';

type TestFixture = {
  app: StartCliResult;
};

type WorkerFixture = {
  targetApp: CreateApp.TargetApp;
  optionsApp: CreateApp.OptionsApp;
  settingApp: CreateApp.SettingApp;
  createApp: CreateApp.CreateCustomApp;
};

export const test = base.extend<TestFixture, WorkerFixture>({
  targetApp: [
    {
      name: 'router',
      cwd: __dirname,
      config: {
        experiments: {
          viewTransitions: true,
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  settingApp,
  createApp,
  app,
});
