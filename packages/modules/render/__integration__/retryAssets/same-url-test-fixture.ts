import { test as base } from '@playwright/test';
import sharedEnv from '@tramvai/internal-test-utils/env';
import type { BuildAppTypes } from '@tramvai/test-pw';
import { buildAppFixture, appServerFixture } from '@tramvai/test-pw';

type AppFixtures = {
  appServer: BuildAppTypes.AppServer;
};

type WorkerFixture = {
  appTarget: BuildAppTypes.AppTarget;
  buildOptions: BuildAppTypes.BuildOptions;
  buildApp: void;
  appServerOptions: BuildAppTypes.AppServerOptions;
};

const defaultEnv = { ...sharedEnv };
delete defaultEnv.NODE_ENV;
delete defaultEnv.ASSETS_PREFIX;

/**
 * The same application as in `test-fixture.ts`, but with an empty `RETRY_HOSTNAME_MAP`,
 * so a retry goes to the same url instead of a fallback host.
 * A separate fixture file is needed because `appServerOptions` is a worker-scoped
 * fixture and cannot be overridden with `test.use` inside a describe group.
 */
export const test = base.extend<AppFixtures, WorkerFixture>({
  appTarget: [
    {
      name: 'retry-assets',
      cwd: __dirname,
    },
    { scope: 'worker', auto: true },
  ],
  buildApp: buildAppFixture,
  buildOptions: [{}, { scope: 'worker', auto: true, option: true }],
  appServer: appServerFixture,
  appServerOptions: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use({
        env: {
          ...defaultEnv,
          RETRY_TO_SAME_URL: 'true',
        },
      });
    },
    { scope: 'worker', auto: true, option: true },
  ],
});
