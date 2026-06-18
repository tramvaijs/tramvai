import { resolve } from 'path';
import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { ModuleTramvai } from '@tramvai/internal-test-utils/fixtures/tramvai';
import { TramvaiFixture } from '@tramvai/internal-test-utils/fixtures/tramvai';

type TestFixture = {
  app: CreateApp.App;
  buildAllureTree: void;
  I: IAction;
  tramvai: ModuleTramvai;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.App;
  optionsApp: CreateApp.OptionsApp | undefined;
};

const targetApp: CreateApp.TargetApp = {
  target: 'lazy-modules',
  cwd: resolve(__dirname, '..'),
};

export const test = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [{}, { scope: 'worker', auto: true }],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  tramvai: TramvaiFixture,
});
