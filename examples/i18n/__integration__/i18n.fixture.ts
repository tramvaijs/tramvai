import type { Page, TestFixture, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { sleep } from '@tramvai/test-integration';

/**
 * Component Object for i18n operations and assertions
 */
export class I18nComponentObject {
  constructor(public page: Page) {}

  // Locators
  get languageSelect(): Locator {
    return this.page.locator('#language-select');
  }

  currentLanguageDisplay(lang: string): Locator {
    return this.page.locator('footer div div', { hasText: /Текущий язык|Current Language/ });
  }

  routingStrategyDisplay(lang: string): Locator {
    return this.page.locator('footer div div', { hasText: /Стратегия роутинга|Routing Strategy/ });
  }

  updateStrategyDisplay(lang: string): Locator {
    return this.page.locator('footer div div', { hasText: /Стратегия обновления|Update Strategy/ });
  }

  // Navigation helpers
  homeLink(): Locator {
    return this.page.locator('nav a', { hasText: /Home|Главная/ });
  }

  aboutLink(): Locator {
    return this.page.locator('nav a', { hasText: /About|О нас/ });
  }

  contactLink(): Locator {
    return this.page.locator('nav a', { hasText: /Contact|Контакты/ });
  }

  productsLink(): Locator {
    return this.page.locator('nav a', { hasText: /Products|Продукты/ });
  }

  // Actions
  async switchLanguage(lang: string): Promise<void> {
    await this.languageSelect.selectOption(lang);
    await this.waitForReload();
  }

  async clickHomeLink(): Promise<void> {
    await this.homeLink().click();
    await this.page.waitForURL(
      (url) => url.pathname === '/' || url.pathname === '/en/' || url.pathname === '/ru/'
    );
    // Wait for SPA navigation to complete
    await sleep(50);
  }

  async clickAboutLink(): Promise<void> {
    await this.aboutLink().click();
    await this.page.waitForURL(
      (url) =>
        url.pathname === '/about/' || url.pathname === '/en/about/' || url.pathname === '/ru/about/'
    );
    // Wait for SPA navigation to complete
    await sleep(50);
  }

  async clickContactLink(): Promise<void> {
    await this.contactLink().click();
    await this.page.waitForURL(
      (url) =>
        url.pathname === '/contact/' ||
        url.pathname === '/en/contact/' ||
        url.pathname === '/ru/contact/'
    );
    // Wait for SPA navigation to complete
    await sleep(50);
  }

  async clickProductsLink(): Promise<void> {
    await this.productsLink().click();
    await this.page.waitForURL(
      (url) =>
        url.pathname === '/products/' ||
        url.pathname === '/en/products/' ||
        url.pathname === '/ru/products/'
    );
    // Wait for SPA navigation to complete
    await sleep(50);
  }

  // Cookie operations
  async setLanguageCookie(lang: string, domain: string): Promise<void> {
    await this.page.context().addCookies([
      {
        name: 'tramvai_locale',
        value: lang,
        domain,
        path: '/',
      },
    ]);
  }

  async getLanguageCookie(): Promise<string | undefined> {
    const cookies = await this.page.context().cookies();
    const languageCookie = cookies.find((c) => c.name === 'tramvai_locale');
    return languageCookie?.value;
  }

  async clearLanguageCookie(): Promise<void> {
    await this.page.context().clearCookies({ name: 'tramvai_locale' });
  }

  async setAcceptLanguageHeader(value: string): Promise<void> {
    await this.page.route('**/*', (route) => {
      const headers = route.request().headers();

      headers['accept-language'] = value;

      route.continue({ headers });
    });
  }

  // Page content assertions helpers
  async getPageTitle(): Promise<string> {
    const h2 = await this.page.locator('h2').first().textContent();
    return h2 || '';
  }

  async hasRussianContent(): Promise<boolean> {
    const content = await this.page.textContent('body');
    // Check for Cyrillic characters
    return /[А-Яа-я]/.test(content || '');
  }

  async hasEnglishContent(): Promise<boolean> {
    const title = await this.getPageTitle();
    // Check for specific English words that shouldn't appear in Russian
    return /Welcome|Features|Products|About/.test(title);
  }

  // URL helpers
  getCurrentPath(): string {
    return new URL(this.page.url()).pathname;
  }

  async expectPathToMatch(pattern: string | RegExp): Promise<void> {
    const path = this.getCurrentPath();
    if (typeof pattern === 'string') {
      expect(path).toBe(pattern);
    } else {
      expect(path).toMatch(pattern);
    }
  }

  async expectLanguageInUrl(lang: string | null): Promise<void> {
    const path = this.getCurrentPath();
    if (lang === null) {
      // Check that path doesn't start with /ru/ or /en/
      expect(path).not.toMatch(/^\/(ru|en)\//);
    } else {
      expect(path).toMatch(new RegExp(`^/${lang}/`));
    }
  }

  // SEO helpers
  async getHtmlLangAttribute(): Promise<string | null> {
    return this.page.locator('html').getAttribute('lang');
  }

  // Configuration helpers
  async getRoutingStrategy(): Promise<string> {
    const lang = await this.getLanguageCookie();
    const text = await this.routingStrategyDisplay(lang!).textContent({ timeout: 5000 });
    return text?.split(':')[1]?.trim() || '';
  }

  async getUpdateStrategy(): Promise<string> {
    const lang = await this.getLanguageCookie();
    const text = await this.updateStrategyDisplay(lang!).textContent({ timeout: 5000 });
    return text?.split(':')[1]?.trim() || '';
  }

  async getCurrentLanguageFromFooter(): Promise<string> {
    const lang = await this.getLanguageCookie();
    const text = await this.currentLanguageDisplay(lang!).textContent({ timeout: 5000 });
    return text?.split(':')[1]?.trim() || '';
  }

  // Navigation state helpers
  async waitForReload(): Promise<void> {
    try {
      const spaMode = await this.page.evaluate(() => {
        return (
          (window as any).contextExternal.di.get('tramvai i18n configuration').updateStrategy ===
          'update'
        );
      });

      if (spaMode) {
        await sleep(50);
      } else {
        await this.page.waitForNavigation();
      }
    } catch (e) {
      await this.page.waitForNavigation();
    }
  }

  // Get all navigation links
  async getNavigationLinks(): Promise<string[]> {
    const links = await this.page.locator('nav a').all();
    const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')));
    return hrefs.filter((href): href is string => href !== null);
  }
}

export const I18nFixture: TestFixture<I18nComponentObject, { page: Page }> = async (
  { page },
  use
) => {
  const i18n = new I18nComponentObject(page);

  await use(i18n);
};
