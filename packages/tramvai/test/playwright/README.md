# Tramvai test Playwright

Set of helpers for using [playwright](https://playwright.dev) in the integration tests

> `Playwright` should be installed separately

## Installation

```bash npm2yarn
npm install --save-dev @tramvai/test-pw
```

## Usage

### Configuration

Create file `playwright.config.ts` with defaults from `@tramvai/test-pw` package:

```ts title="playwright.config.ts"
import { createPlaywrightConfig } from '@tramvai/test-pw';

export default createPlaywrightConfig();
```

You can always extend default config, here is `createPlaywrightConfig` type definition:

```ts
// passed configuration object will be merged with defaults
type createPlaywrightConfig = (config: PlaywrightTestConfig) => PlaywrightTestConfig;
```

### Testing

:::tip

Use case for this section and `startAppFixture` - monorepo with many tramvai modules and example applications, where you need to test independent features.

All usage of `startAppFixture` in different workers will run development build, which might not be optimal for tests execution time, if you want to test the same app in different cases.

For real applications, prefer to run application once as [web server](https://playwright.dev/docs/test-webserver) or manually and pass `baseUrl` after.

:::

`@tramvai/test-pw` provide a useful fixture for application start (local server in development mode) and testing - `startAppFixture`. This fixture use `startCli` method from [@tramvai/test-integration](references/tramvai/test/integration.md) package.

First, you need to add and configure this fixture for application tests:

```ts title="__integration__/test-fixture.ts"
import path from 'path';
import { test as base } from '@playwright/test';
import type { StartAppTypes } from '@tramvai/test-pw';
import { startAppFixture } from '@tramvai/test-pw';

type TestFixture = {};

type WorkerFixture = {
  app: StartAppTypes.TestApp;
  appTarget: StartAppTypes.AppTarget;
  startOptions: StartAppTypes.StartOptions;
};

export const test = base.extend<TestFixture, WorkerFixture>({
  appTarget: [
    // provide application name and directory
    {
      target: 'appName',
      cwd: path.resolve(__dirname, '..'),
    },
    { scope: 'worker', auto: true, option: true },
  ],
  // any `startCli` parameters
  startOptions: [{
    env: {
      SOME_MOCKED_API: 'xxx'
    },
  }, { scope: 'worker', auto: true, option: true }],

  app: startAppFixture,
});
```

Then, use the `app` object in integration tests:

```ts title="__integration__/appName.integration.ts"
import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('examples/app', async () => {
  test('Navigation is visible', async ({ app, page }) => {
    await page.goto(app.serverUrl);

    expect(page.getByRole('navigation')).toBeVisible();
  });
});
```

You can find more info about `app` object in our [Testing Guide](guides/testing.md#integration-tests)

### Production build testing

If you need to test production build, `@tramvai/test-pw` provide a few fixtures for it:
- `appServerFixture` to run compiled application server
- `buildAppFixture` to run production build of the application (will be called implicitly for `appServerFixture`)

First, configure fixtures:

```ts title="__integration__/test-fixture.ts"
import path from 'path';
import { test as base } from '@playwright/test';
import type { BuildAppTypes } from '@tramvai/test-pw';
import { appServerFixture } from '@tramvai/test-pw';

type TestFixture = {};

type WorkerFixture = {
  app: BuildAppTypes.TestApp;
  appTarget: BuildAppTypes.AppTarget;
  buildOptions: BuildAppTypes.StartOptions;
};

export const test = base.extend<TestFixture, WorkerFixture>({
  appTarget: [
    // provide application name and directory
    {
      target: 'appName',
      cwd: path.resolve(__dirname, '..'),
    },
    { scope: 'worker', auto: true, option: true },
  ],
  // any `buildCli` parameters
  buildOptions: [{
    env: {
      SOME_MOCKED_API: 'xxx'
    },
  }, { scope: 'worker', auto: true, option: true }],

  appServer: appServerFixture,
});
```

Then, use the `appServer` object in integration tests:

```ts title="__integration__/appName.integration.ts"
import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('examples/app', async () => {
  test('Navigation is visible', async ({ appServer, page }) => {
    await page.goto(`http://localhost:${appServer.port}/`);

    expect(page.getByRole('navigation')).toBeVisible();
  });
});
```
