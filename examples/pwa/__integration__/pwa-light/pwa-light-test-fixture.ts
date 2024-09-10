import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import { dirname, resolve } from 'path';
import type { PwaComponentObject } from '../pwa-fixture';
import { PwaFixture } from '../pwa-fixture';

type AppFixtures = {
  app: StartCliResult;
  buildAllureTree: void;
  I: IAction;
  Pwa: PwaComponentObject;
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
      name: 'pwa-light',
      cwd: dirname(resolve(module.parent!.filename, './')),
      config: {},
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  buildAllureTree,
  I: IFixture,
  Pwa: PwaFixture,
});
