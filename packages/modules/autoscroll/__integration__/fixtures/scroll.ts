import type { TestFixture, Page } from '@playwright/test';

export class ScrollComponentObject {
  constructor(private page: Page) {}

  async scrollTo(options?: ScrollToOptions) {
    return this.page.evaluate((scrollOptions?: ScrollToOptions) => {
      return window.scrollTo(scrollOptions);
    }, options);
  }

  async getCurrentScrollValue() {
    return this.page.evaluate(() => {
      return window.scrollY;
    });
  }

  async setHistoryScrollRestoration(value: 'manual' | 'auto') {
    return this.page.evaluate((scrollRestoration: 'manual' | 'auto') => {
      window.history.scrollRestoration = scrollRestoration;
    }, value);
  }

  async waitForSmoothScrollEnd() {
    return this.page.evaluate(() => {
      let scrollingInCurrentStep = false;
      window.addEventListener('scroll', () => {
        scrollingInCurrentStep = true;
      });
      return new Promise((resolve) => {
        document.addEventListener('scrollend', resolve, { once: true });
        // fallback if scroll behavior is instant or page is not scrolled at all
        setTimeout(() => {
          if (!scrollingInCurrentStep) resolve(null);
        }, 300);
      });
    });
  }
}

export const ScrollFixture: TestFixture<ScrollComponentObject, { page: Page }> = async (
  { page },
  use
) => {
  const ScrollCO = new ScrollComponentObject(page);
  await use(ScrollCO);
};
