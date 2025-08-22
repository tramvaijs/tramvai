import { wrapRouter } from '@tramvai/test-pw/src/router';
import { test as testBase } from './fixture';

export function testcasesFactory(test: typeof testBase, label: string) {
  const SCROLL_VALUE = 500;

  test.describe(label, async () => {
    let router: ReturnType<typeof wrapRouter>;

    test.beforeEach(async ({ page }) => {
      router = wrapRouter(page);
    });

    test.describe('without disableAutoscroll', async () => {
      test('after navigation page scrolls to top', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b' });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
      });

      test('navigation back restores previous page scroll', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b' });
        await scroll.waitForSmoothScrollEnd();
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });
    });

    test.describe('with disableAutoscroll', async () => {
      test('after navigation page scroll remains the same', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({
          url: '/b',
          navigateState: { disableAutoscroll: true },
        });
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('navigation back restores previous page scroll because of browser.scrollRestoration', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({
          url: '/b',
          navigateState: { disableAutoscroll: true },
        });
        await router.back(-1);
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('navigation back with history.scrollRestoration="manual" does not restore previous page scroll', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.setHistoryScrollRestoration('manual');
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({
          url: '/b',
          navigateState: { disableAutoscroll: true },
        });
        await router.back(-1);
        await scroll.waitForSmoothScrollEnd();

        await test.expect
          .poll(async () => {
            const value = await scroll.getCurrentScrollValue();
            return value;
          })
          .toEqual(SCROLL_VALUE);
      });
    });
  });
}
