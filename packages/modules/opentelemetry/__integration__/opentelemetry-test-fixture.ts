import { test as base } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import { dirname, resolve } from 'path';
import { SpyRequests, SpyRequestsFixture } from '@tramvai/internal-test-utils/fixtures/spyRequest';

type AppFixtures = {
  app: StartCliResult;
  buildAllureTree: void;
  I: IAction;
  spyRequest: SpyRequests;
};

type WorkerFixture = {
  targetApp: CreateApp.TargetApp;
  optionsApp: CreateApp.OptionsApp;
  settingApp: CreateApp.SettingApp;
  createApp: CreateApp.CreateCustomApp;
};

const optionsApp: CreateApp.OptionsApp = {
  env: {
    MOCK_API: 'https://httpbin.org',
  },
};

export const test = base.extend<AppFixtures, WorkerFixture>({
  targetApp: [
    {
      name: 'opentelemetry-app',
      cwd: dirname(resolve(module.parent!.filename, './')),
      config: {
        name: 'opentelemetry-app',
      },
    },
    { scope: 'worker', auto: true },
  ],
  settingApp,
  createApp,
  optionsApp: [optionsApp, { scope: 'worker', auto: true, option: true }],
  app,
  buildAllureTree,
  I: IFixture,
  spyRequest: SpyRequestsFixture,
});
