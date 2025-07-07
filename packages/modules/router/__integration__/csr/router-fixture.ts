import type { TestFixture, BrowserContext, Page } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';

export class RouterComponentObject {
  constructor(private page: Page) {}

  navigate(path: string | Record<string, any>) {
    return this.page.evaluate((path) => {
      return window.contextExternal.di.get('router router').navigate(path);
    }, path);
  }

  navigateThenWaitForReload(path: string) {
    return this.page.evaluate((path) => {
      return window.contextExternal.di.get('router router').navigateThenWaitForReload(path);
    }, path);
  }

  updateCurrentRoute(path: string | Record<string, any>) {
    return this.page.evaluate((path) => {
      return window.contextExternal.di.get('router router').updateCurrentRoute(path);
    }, path);
  }

  getCurrentRoute() {
    return this.page.evaluate(() => {
      return window.contextExternal.di.get('router router').getCurrentRoute();
    });
  }

  getCurrentUrl() {
    return this.page.evaluate(() => {
      return window.contextExternal.di.get('router router').getCurrentUrl();
    });
  }

  back() {
    return this.page.evaluate(() => {
      return window.contextExternal.di
        .get('router router')
        .back({ replace: true, historyFallback: `/history-fallback/` });
    });
  }

  getHistoryState() {
    return this.page.evaluate(() => {
      return window.history.state;
    });
  }

  checkLatestNavigationType(type: string) {
    return this.page.waitForFunction((expectedType) => {
      return window.__LATEST_NAVIGATION_TYPE__ === expectedType;
    }, type);
  }

  internalRouterStateFromDi() {
    return this.page.evaluate(() => {
      return window.contextExternal.di.get('router router').lastNavigation;
    });
  }

  internalRouterStateFromState() {
    return this.page.evaluate(() => {
      return window.contextExternal.getState().router;
    });
  }

  getRouteName() {
    return this.page.evaluate(() => {
      return document.getElementById('route-name')?.innerText;
    });
  }

  getPageTitle() {
    return this.page.evaluate(() => {
      return document.getElementById('page')?.innerText;
    });
  }

  getUrlPath() {
    return this.page.evaluate(() => {
      return document.getElementById('url-path')?.innerText;
    });
  }

  getUseRoute() {
    return this.page.evaluate(() => {
      return document.getElementById('use-route')?.innerText;
    });
  }
}

export const RouterFixture: TestFixture<
  RouterComponentObject,
  { page: Page; context: BrowserContext; app: CreateApp.App }
> = async ({ page }, use) => {
  const Router = new RouterComponentObject(page);
  await use(Router);
};
