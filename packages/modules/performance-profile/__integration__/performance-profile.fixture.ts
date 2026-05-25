import { test as base } from '@playwright/test';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { settingApp, app, createApp } from '@tramvai/internal-test-utils/fixtures/create-app';

type AppFixtures = {
  app: StartCliResult;
  I: IAction;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  optionsApp: CreateApp.OptionsApp | undefined;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.CreateCustomApp;
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'performance-profile',
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
