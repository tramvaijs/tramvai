import { expect } from '@playwright/test';
import { testPrefixStrategy as test } from './test.fixture';

/**
 * Test suite for prefix routing strategy
 * All languages have prefix: /ru/, /en/
 */
test.describe('i18n - Prefix Routing Strategy', () => {
  test.beforeEach(async ({ I18n }) => {
    await I18n.setAcceptLanguageHeader('');
    await I18n.clearLanguageCookie();
  });

  test.describe('URL Structure', () => {
    test('should require prefix for all languages', async ({ app, I, I18n }) => {
      // Russian requires prefix
      await I.gotoPage(`${app.serverUrl}/ru/`);

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/ru/');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);

      await I18n.clearLanguageCookie();
      // English requires prefix
      await I.gotoPage(`${app.serverUrl}/en/`);

      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toBe('/en/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should not work without prefix', async ({ app, I18n }) => {
      // Root path without prefix should return 404
      const rootResponse = await I18n.page.goto(`${app.serverUrl}/`);
      expect(rootResponse?.status()).toBe(404);

      // Nested route without prefix should return 404
      const aboutResponse = await I18n.page.goto(`${app.serverUrl}/about/`);
      expect(aboutResponse?.status()).toBe(404);
    });
  });

  test.describe('Language Switching', () => {
    test('should maintain prefix when switching languages', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/ru/`);

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/ru/');

      // Switch to English
      await I18n.switchLanguage('en');

      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toBe('/en/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);

      await I18n.clearLanguageCookie();
      // Test on nested route
      await I.gotoPage(`${app.serverUrl}/ru/about/`);
      expect(I18n.getCurrentPath()).toBe('/ru/about/');

      await I18n.switchLanguage('en');

      expect(I18n.getCurrentPath()).toBe('/en/about/');
    });
  });

  test.describe('Navigation', () => {
    test('should generate links with language prefix', async ({ app, I, I18n }) => {
      // Check Russian links
      await I.gotoPage(`${app.serverUrl}/ru/`);

      const ruLinks = await I18n.getNavigationLinks();
      const allHaveRuPrefix = ruLinks.every((href) => href.startsWith('/ru/'));
      expect(allHaveRuPrefix).toBe(true);

      await I18n.clearLanguageCookie();
      // Check English links
      await I.gotoPage(`${app.serverUrl}/en/`);

      const enLinks = await I18n.getNavigationLinks();
      const allHaveEnPrefix = enLinks.every((href) => href.startsWith('/en/'));
      expect(allHaveEnPrefix).toBe(true);
    });
  });
});
