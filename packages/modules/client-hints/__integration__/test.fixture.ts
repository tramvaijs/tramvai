import { dirname, resolve } from 'path';
import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { ClientHintsComponentObject } from './client-hints.fixture';
import { ClientHintsFixture } from './client-hints.fixture';

type TestFixture = {
  app: CreateApp.App;
  buildAllureTree: void;
  I: IAction;
  ClientHints: ClientHintsComponentObject;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  optionsApp: CreateApp.OptionsApp | undefined;
  targetApp: CreateApp.TargerApp;
  createApp: CreateApp.App;
};

const targetApp: CreateApp.TargerApp = {
  name: 'client-hints',
  cwd: dirname(resolve(module.parent!.filename, './')),
};

const optionsApp: CreateApp.OptionsApp = {
  env: {
    TRAMVAI_FORCE_CLIENT_SIDE_RENDERING: 'true',
  },
};

export const testChrome = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [optionsApp, { scope: 'worker', auto: true, option: true }],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  ClientHints: ClientHintsFixture,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
});

export const testSafari = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [optionsApp, { scope: 'worker', auto: true, option: true }],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  ClientHints: ClientHintsFixture,
  browserName: 'webkit',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
});
