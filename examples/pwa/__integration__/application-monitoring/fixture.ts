import type { TestFixture, BrowserContext, Page } from '@playwright/test';
import type { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';

export class AppComponentObject {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private app: CreateApp.App
  ) {}
}

export const AppFixture: TestFixture<
  AppComponentObject,
  { page: Page; context: BrowserContext; app: CreateApp.App }
> = async ({ page, context, app }, use) => {
  const App = new AppComponentObject(page, context, app);
  await use(App);
};
