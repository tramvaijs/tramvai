import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('@tramvai/module-http-client', () => {
  test('custom dispatcher interceptor should be applied', async ({ I, app, page }) => {
    await I.gotoPage(`${app.serverUrl}/http-client-dispatcher/`);

    const state = await page.getByTestId('test-dispatcher-state').textContent();

    expect(state).toBe('/foo/bar');
  });
});
