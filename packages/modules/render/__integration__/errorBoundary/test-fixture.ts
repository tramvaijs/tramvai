import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import { dirname, resolve } from 'path';
import { pageContentFixture } from './fixtures/page-content';
import type { PageContentCO } from './fixtures/page-content';

type AppFixtures = {
  app: StartCliResult;
  buildAllureTree: void;
  I: IAction;
  pageContent: PageContentCO;
};

type WorkerFixture = {
  targetApp: CreateApp.TargetApp;
  optionsApp: CreateApp.OptionsApp;
  settingApp: CreateApp.SettingApp;
  createApp: CreateApp.CreateCustomApp;
};

const csrOptionsApp: CreateApp.OptionsApp = {
  env: {
    // CSR exclusively, because we added only client-side error handling
    TRAMVAI_FORCE_CLIENT_SIDE_RENDERING: 'true',
  },
};

export const csrTest = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'error-boundary',
      cwd: dirname(resolve(module.parent!.filename, './')),
      config: {
        define: {
          development: {
            'process.env.TEST_DEFAULT_ERROR_BOUNDARY': 'true',
          },
        },
        fileSystemPages: {
          enabled: true,
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  optionsApp: [csrOptionsApp, { scope: 'worker', auto: true, option: true }],
  createApp,
  app,
  buildAllureTree,
  I: IFixture,
  pageContent: pageContentFixture,
});

export const ssrTest = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'error-boundary',
      cwd: dirname(resolve(module.parent!.filename, './')),
      config: {
        define: {
          development: {
            'process.env.TEST_DEFAULT_ERROR_BOUNDARY': 'true',
          },
        },
        fileSystemPages: {
          enabled: true,
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  buildAllureTree,
  I: IFixture,
  pageContent: pageContentFixture,
});

export const legacySsrTest = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'error-boundary',
      cwd: dirname(resolve(module.parent!.filename, './')),
      config: {
        fileSystemPages: {
          enabled: true,
        },
      },
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [{}, { scope: 'worker', auto: true, option: true }],
  app,
  buildAllureTree,
  I: IFixture,
  pageContent: pageContentFixture,
});
