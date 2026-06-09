import type { Page } from '@playwright/test';
import { wrapRouter } from '@tramvai/test-pw/src/router';
import { test as testBase } from './fixture';

const go = (page: Page, delta: number) => {
  return page.evaluate((d: number) => {
    return (window as any).contextExternal.di.get('router pageService').go(d);
  }, delta);
};

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
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
      });

      test('after navigation back restores previous scroll position', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('after query params change scrolls to top', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/?foo=bar' });
        await scroll.waitForSmoothScrollEnd();
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
          url: '/b/',
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
          url: '/b/',
          navigateState: { disableAutoscroll: true },
        });
        await router.back(-1);
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('navigation back from page with disabled autoscroll restores previous page scroll', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({
          url: '/b/',
          navigateState: { disableAutoscroll: true },
        });
        await router.back(-1);
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('navigation back with explicit history.scrollRestoration="manual" still restores scroll because module overrides it', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.setHistoryScrollRestoration('manual');
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({
          url: '/b/',
          navigateState: { disableAutoscroll: true },
        });
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
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
          url: '/b/',
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

    test.describe('AUTOSCROLL_DISABLED_TOKEN', async () => {
      test('disables autoscroll for replace navigation', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b/', query: { autoscroll_disabled: 'true' } });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('does not affect non-replace navigation', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b', query: { autoscroll_disabled: 'false' } });
        await scroll.waitForSmoothScrollEnd();
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
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(CUSTOM_SCROLL_TOP);
      });
    });

    test.describe('router.go(-N) multi-step history navigation', async () => {
      test('go(-2) restores scroll position of the target page', async ({ app, page, scroll }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await router.navigate({ url: '/c/' });
        await scroll.waitForSmoothScrollEnd();
        await go(page, -2);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });
    });

    test.describe('replace: true navigation', async () => {
      test('after navigate with replace, back skips replaced entry and restores correct scroll', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        // replace /b with /c at the same history index
        await router.navigate({ url: '/c/', replace: true });
        await scroll.waitForSmoothScrollEnd();
        // back should go to / (not /b, which was replaced)
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });

      test('scroll position is not restored for replaced url at same index', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        // navigate to /b, scroll, then replace with /c
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await scroll.scrollTo({ top: 300, behavior: 'instant' });
        await router.navigate({ url: '/c/', replace: true });
        await scroll.waitForSmoothScrollEnd();
        // navigate forward, then back to /c
        await router.navigate({ url: '/b/' });
        await scroll.waitForSmoothScrollEnd();
        await router.back(-1);

        // should not restore /b's 300px scroll since the url at this index is now /c
        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(0);
      });
    });

    test.describe('updateCurrentRoute scroll saving', async () => {
      test('back past updateCurrentRoute restores original page scroll position', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        // updateCurrentRoute without replace pushes new history entry
        await router.updateCurrentRoute({ query: { foo: 'bar' } });
        // go back past the updateCurrentRoute entry to the original page
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });
    });

    test.describe('anchor/hash navigation', async () => {
      test('navigation to url with hash scrolls to anchor instead of restoring position', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/c/#anchor-section' });
        await scroll.waitForSmoothScrollEnd();
        const scrollAfterHashNav = await scroll.getCurrentScrollValue();
        // should scroll to the anchor element, not to top
        test.expect(scrollAfterHashNav).toBeGreaterThan(0);
      });

      test('back navigation from hash page restores previous scroll', async ({
        app,
        page,
        scroll,
      }) => {
        await page.goto(app.serverUrl);
        await scroll.scrollTo({ top: SCROLL_VALUE, behavior: 'instant' });
        await router.navigate({ url: '/c/#anchor-section' });
        await scroll.waitForSmoothScrollEnd();
        await router.back(-1);

        await test.expect
          .poll(async () => {
            return scroll.getCurrentScrollValue();
          })
          .toEqual(SCROLL_VALUE);
      });
    });
  });
}
