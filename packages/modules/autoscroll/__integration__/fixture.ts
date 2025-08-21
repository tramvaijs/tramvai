import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { app, createApp, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { StartCliResult } from '@tramvai/test-integration';
import { ScrollFixture, type ScrollComponentObject } from './fixtures/scroll';

type TestFixture = {
  app: StartCliResult;
  scroll: ScrollComponentObject;
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
      name: 'view-transition',
      cwd: __dirname,
      config: {},
    },
    { scope: 'worker', auto: true },
  ],
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  settingApp,
  createApp,
  app,
  scroll: ScrollFixture,
});
