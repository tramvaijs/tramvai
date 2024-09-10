import { resolve } from 'path';
import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';

import type { ViewTransitionsComponentObject } from './view-transitions.fixture';
import { ViewTransitionsFixture } from './view-transitions.fixture';

type TestFixture = {
  app: CreateApp.App;
  buildAllureTree: void;
  I: IAction;
  ViewTransitions: ViewTransitionsComponentObject;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.App;
  optionsApp: CreateApp.OptionsApp | undefined;
};

const targetApp: CreateApp.TargetApp = {
  name: 'view-transitions',
  cwd: resolve(module.path, '..', 'src'),
  config: {
    postcss: {
      config: resolve(module.path, '..', 'postcss.js'),
      cssModulePattern: '^(?!.*global\\.css$).*$',
    },
    fileSystemPages: {
      enabled: true,
    },
    experiments: {
      viewTransitions: true,
    },
  },
};

export const test = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [undefined, { scope: 'worker', auto: true }],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  ViewTransitions: ViewTransitionsFixture,
});
