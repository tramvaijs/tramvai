import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import type { PlaywrightTestConfig } from '@playwright/test';
// we can't import from `@playwright/test` because it will override some jest globals as side-effect
// https://github.com/microsoft/playwright/issues/19798
import { devices } from 'playwright-core';
import envCi from 'env-ci';

const ciInfo = envCi();

const config: PlaywrightTestConfig = {
  testDir: '.',
  testMatch: /.*\.(integration)\.(js|ts)/,
  fullyParallel: true,
  retries: ciInfo.isCi ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: ciInfo.isCi ? 'retain-on-failure' : 'on',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};

export const createPlaywrightConfig = (userConfig: Partial<PlaywrightTestConfig> = {}) => {
  return mergeDeep({}, config, userConfig);
};
