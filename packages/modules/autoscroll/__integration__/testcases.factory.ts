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

      test('after navigation back scrolls to top', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b' });
        await scroll.waitForSmoothScrollEnd();
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
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

      test('navigation back restores previous page scroll when previous page has disabled autoscroll', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.updateCurrentRoute({
          navigateState: { disableAutoscroll: true },
        });
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

      test('navigation back from page with disabled autoscroll does not restore previous page scroll', async ({
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
          .toEqual(0);
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

        // Браузер не восстанавливает скролл (manual), и на текущем маршруте
        // disableAutoscroll не установлен — поэтому autoscroll скроллит наверх
        await test.expect
          .poll(async () => {
            const value = await scroll.getCurrentScrollValue();
            return value;
          })
          .toEqual(0);
      });

      test('disableAutoscroll does not leak to the next navigation', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        // Первый переход с disableAutoscroll=true — скролл не меняется
        await router.navigate({
          url: '/b',
          navigateState: { disableAutoscroll: true },
        });
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
        // Следующий переход уже без флага — ожидаем, что скролл уйдет в топ
        await router.navigate({ url: '/' });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
      });
    });

    test.describe('AUTOSCROLL_BEHAVIOR_MODE_TOKEN as function', async () => {
      test('uses value returned by function as scroll behavior', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        // В тестовом приложении AUTOSCROLL_BEHAVIOR_MODE_TOKEN зарегистрирован как
        // функция, читающая query-параметр autoscroll_behavior. При значении 'auto'
        // скролл должен быть мгновенным, без анимации
        await router.navigate({ url: '/b?autoscroll_behavior=auto' });
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
      });
    });

    test.describe('AUTOSCROLL_SCROLL_TOP_TOKEN as function', async () => {
      test('uses value from sessionStorage as scroll top', async ({ app, page, scroll }) => {
        const CUSTOM_SCROLL_TOP = 200;
        await page.goto(app.serverUrl);
        // В тестовом приложении AUTOSCROLL_SCROLL_TOP_TOKEN зарегистрирован как
        // функция, которая читает значение из sessionStorage
        await page.evaluate((value: string) => {
          window.sessionStorage.setItem('autoscroll_scroll_top', value);
        }, String(CUSTOM_SCROLL_TOP));
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b' });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(CUSTOM_SCROLL_TOP);
      });
    });
  });
}
