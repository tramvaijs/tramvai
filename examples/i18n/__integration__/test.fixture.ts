import { resolve } from 'path';
import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';
import type { ModuleTramvai } from '@tramvai/internal-test-utils/fixtures/tramvai';
import { TramvaiFixture } from '@tramvai/internal-test-utils/fixtures/tramvai';

import type { I18nComponentObject } from './i18n.fixture';
import { I18nFixture } from './i18n.fixture';

type TestFixture = {
  app: CreateApp.App;
  buildAllureTree: void;
  I: IAction;
  tramvai: ModuleTramvai;
  I18n: I18nComponentObject;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  targetApp: CreateApp.TargetApp;
  createApp: CreateApp.App;
  optionsApp: CreateApp.OptionsApp | undefined;
};

const targetApp: CreateApp.TargetApp = {
  target: 'i18n',
  cwd: resolve(__dirname, '..'),
};

/**
 * Base test fixture with default i18n configuration
 * - routingStrategy: prefix_except_default
 * - updateStrategy: reload
 * - defaultLanguage: ru
 * - availableLanguages: ru, en
 */
export const test = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [{}, { scope: 'worker', auto: true }],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  I18n: I18nFixture,
  tramvai: TramvaiFixture,
  locale: 'ru',
});

/**
 * Test fixture with prefix routing strategy
 * All languages have prefix: /ru/, /en/, /zh/
 */
export const testPrefixStrategy = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [
    {
      env: {
        I18N_ROUTING_STRATEGY: 'prefix',
      },
    },
    { scope: 'worker', auto: true },
  ],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  I18n: I18nFixture,
  tramvai: TramvaiFixture,
  locale: 'ru',
});

/**
 * Test fixture with prefix_and_default routing strategy
 * Default language works with and without prefix: / or /ru/, /en/
 */
export const testPrefixAndDefaultStrategy = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [
    {
      env: {
        I18N_ROUTING_STRATEGY: 'prefix_and_default',
      },
    },
    { scope: 'worker', auto: true },
  ],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  I18n: I18nFixture,
  tramvai: TramvaiFixture,
  locale: 'ru',
});

/**
 * Test fixture with no_prefix routing strategy
 * No language prefix in URLs: / (all languages)
 */
export const testNoPrefixStrategy = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [
    {
      env: {
        I18N_ROUTING_STRATEGY: 'no_prefix',
      },
    },
    { scope: 'worker', auto: true },
  ],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  I18n: I18nFixture,
  tramvai: TramvaiFixture,
  locale: 'ru',
});

/**
 * Test fixture with update strategy (SPA transitions)
 * Language switching uses SPA navigation instead of page reload
 */
export const testUpdateStrategy = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [
    {
      env: {
        I18N_UPDATE_STRATEGY: 'update',
      },
    },
    { scope: 'worker', auto: true },
  ],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  I18n: I18nFixture,
  tramvai: TramvaiFixture,
  locale: 'ru',
});
