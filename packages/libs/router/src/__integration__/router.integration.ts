import { wrapRouter } from '@tramvai/test-pw/src/router';
import { test } from './fixture';

test.describe('router with view-transition enabled', async () => {
  let router: ReturnType<typeof wrapRouter>;

  test.beforeEach(async ({ page }) => {
    router = wrapRouter(page);
  });

  test('should redirect by guard on first load', async ({ app, page }) => {
    await page.goto(app.serverUrl);
    const url = await router.getCurrentUrl();
    await test.expect(url.pathname).toEqual('/b/');
  });
});
