import type { Page, TestFixture } from '@playwright/test';

declare global {
  interface Window {
    __observingResult__: Array<string>;
    __viewTransitions__: Array<{ pathname: string; types?: string[] }>;
  }
}

export class ViewTransitionsComponentObject {
  constructor(private page: Page) {}

  async mockStartViewTransition() {
    await this.page.evaluate(() => {
      window.__viewTransitions__ = [];

      // @ts-ignore
      document.startViewTransition = ({ types }) => {
        window.__viewTransitions__.push({
          pathname: window.location.pathname,
          types,
        });

        return {
          ready: Promise.resolve(),
          finished: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: () => {},
        };
      };
    });
  }

  getViewTransitions(): Promise<Array<{ pathname: string; types?: string[] }>> {
    return this.page.evaluate(() => window.__viewTransitions__);
  }
}

export const ViewTransitionsFixture: TestFixture<
  ViewTransitionsComponentObject,
  { page: Page }
> = async ({ page }, use) => {
  const viewTransitions = new ViewTransitionsComponentObject(page);

  await use(viewTransitions);
};
