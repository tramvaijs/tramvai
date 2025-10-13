import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { ModuleTramvai } from '@tramvai/internal-test-utils/fixtures/tramvai';
import { TramvaiFixture } from '@tramvai/internal-test-utils/fixtures/tramvai';
import { dirname, resolve } from 'path';

type AppFixtures = {
  app: StartCliResult;
  I: IAction;
  tramvai: ModuleTramvai;
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
      name: 'http-client',
      cwd: dirname(resolve(module.parent!.filename, './')),
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  I: IFixture,
  tramvai: TramvaiFixture,
});
