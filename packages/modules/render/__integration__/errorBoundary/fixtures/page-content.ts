import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { TestFixture } from '@playwright/test';

export class PageContentCO {
  private page: Page;
  private app: StartCliResult;

  constructor(page: Page, app: StartCliResult) {
    this.page = page;
    this.app = app;
  }

  async getOuterHtmlOfDocument() {
    return base.step(
      'Получаем document.documentElement.outerHTML страницы с заменой staticUrl и без динамических хэшей',
      async () => {
        const documentContent = await this.page.evaluate(() => {
          return document.documentElement.outerHTML;
        });

        const relevantContent = documentContent
          // eslint-disable-next-line no-template-curly-in-string
          .replace(new RegExp(this.app.staticUrl, 'g'), '${STATIC_URL}')
          .replace(/,"stack".+"/, '')
          .replace(/"error--module__title.+"/, '"error--module__title"');

        return relevantContent;
      }
    );
  }

  toHaveTitle(title: string) {
    return base.step(`Проверяем, что заголовок на странице равен ${title}`, () => {
      return this.page.waitForFunction(
        (pageTitle) => {
          return document.querySelector<HTMLHeadingElement>('main h1')?.innerText === pageTitle;
        },
        title,
        { timeout: 5000 }
      );
    });
  }

  toHaveLayoutText(text: string) {
    return base.step(`Проверяем, что текст лейаута (nav-элемента) равен "${text}"`, () => {
      return this.page.waitForFunction(
        (navText) => {
          return document.querySelector('nav')?.innerText === navText;
        },
        text,
        { timeout: 5000 }
      );
    });
  }

  async navigate(path: string) {
    await base.step(`Осуществляю SPA переход на страницу ${path}`, async () => {
      await this.page.waitForFunction(() =>
        Object.prototype.hasOwnProperty.call(window, 'contextExternal')
      );
      await this.page.evaluate(async (path) => {
        try {
          // @ts-ignore
          window.contextExternal.di.get('router router').navigate(path);
        } catch (e) {
          return e;
        }
      }, path);
    });
  }
}

export const pageContentFixture: TestFixture<
  PageContentCO,
  { page: Page; app: StartCliResult }
> = async ({ page, app }, use) => {
  const pageContentCO = new PageContentCO(page, app);
  await use(pageContentCO);
};
