import path from 'path';
import { test as base } from '@playwright/test';
import { buildAllureTree } from '@tramvai/internal-test-utils/fixtures/build-allure-tree';
import type { BuildAppTypes } from '@tramvai/test-pw';
import { appServerFixture, buildAppFixture } from '@tramvai/test-pw';

const rootDir = path.resolve(__dirname, '..');

type TestFixture = {
  buildAllureTree: void;
  appServer: BuildAppTypes.AppServer;
};

type WorkerFixture = {
  appTarget: BuildAppTypes.AppTarget;
  buildOptions: BuildAppTypes.BuildOptions;
  appServerOptions: BuildAppTypes.AppServerOptions;
  buildApp: void;
};

export const test = base.extend<TestFixture, WorkerFixture>({
  buildAllureTree,
  appTarget: [
    {
      target: 'prerender',
      cwd: rootDir,
    },
    { scope: 'worker', auto: true },
  ],
  buildApp: buildAppFixture,
  buildOptions: [
    {
      // to reuse build cache between prerender and cache-warmup tests
      fileCache: true,
    },
    { scope: 'worker', auto: true, option: true },
  ],
  appServer: appServerFixture,
  appServerOptions: [
    async ({ appTarget }, use) => {
      await use({
        env: {
          CACHE_WARMUP_DISABLED: 'false',
        },
      });
    },
    { scope: 'worker', auto: true, option: true },
  ],
});
