import { dirname, resolve } from 'path';
import { test as base } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { createApp, app, settingApp } from '@tramvai/internal-test-utils/fixtures/create-app';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { IAction } from '@tramvai/internal-test-utils/fixtures/overriding';
import { IFixture } from '@tramvai/internal-test-utils/fixtures/overriding';

type TestFixture = {
  app: CreateApp.App;
  buildAllureTree: void;
  I: IAction;
};

type WorkerFixture = {
  settingApp: CreateApp.SettingApp;
  optionsApp: CreateApp.OptionsApp | undefined;
  targetApp: CreateApp.TargerApp;
  createApp: CreateApp.App;
};

const targetApp = {
  name: 'react-app',
  cwd: dirname(resolve(module.parent!.filename, './')),
};

export const testChrome = base.extend<TestFixture, WorkerFixture>({
  optionsApp: [
    {
      https: true,
      httpsCert: resolve(__dirname, 'certs', 'localhost.pem.tmp'),
      httpsKey: resolve(__dirname, 'certs', 'localhost-key.pem.tmp'),
      env: {
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
      },
    },
    { scope: 'worker', auto: true, option: true },
  ],
  targetApp: [targetApp, { scope: 'worker', auto: true }],
  settingApp,
  createApp,
  buildAllureTree,
  app,
  I: IFixture,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});
