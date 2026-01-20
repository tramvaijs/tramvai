import { expect } from '@playwright/test';
import { testNoPrefixStrategy as test } from './test.fixture';

/**
 * Test suite for no_prefix routing strategy
 * No language prefix in URLs: / (all languages)
 */
test.describe('i18n - No Prefix Routing Strategy', () => {
  test.beforeEach(async ({ I18n }) => {
    await I18n.setAcceptLanguageHeader('');
    await I18n.clearLanguageCookie();
  });

  test.describe('URL Structure', () => {
    test('should not have language prefix in URLs', async ({ app, I, I18n }) => {
      // Russian - no prefix
      await I18n.setLanguageCookie('ru', app.domain);
      await I.gotoPage(`${app.serverUrl}/`);

      expect(I18n.getCurrentPath()).toBe('/');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);

      // English - no prefix
      await I18n.setLanguageCookie('en', app.domain);
      await I.refreshPage();

      expect(I18n.getCurrentPath()).toBe('/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should return 404 when URL has language prefix', async ({ app, I18n }) => {
      // Try to access with Russian prefix
      const ruResponse = await I18n.page.goto(`${app.serverUrl}/ru/`);
      expect(ruResponse?.status()).toBe(404);

      await I18n.clearLanguageCookie();
      // Try to access with English prefix
      const enResponse = await I18n.page.goto(`${app.serverUrl}/en/`);
      expect(enResponse?.status()).toBe(404);
    });
  });

  test.describe('Language Switching', () => {
    test('should not change URL when switching language', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      const initialPath = I18n.getCurrentPath();
      expect(initialPath).toBe('/');

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');

      // Switch to English
      await I18n.switchLanguage('en');

      // URL should remain the same
      expect(I18n.getCurrentPath()).toBe('/');

      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);

      // Test on nested route
      await I.gotoPage(`${app.serverUrl}/about/`);
      expect(I18n.getCurrentPath()).toBe('/about/');

      await I18n.switchLanguage('ru');

      expect(I18n.getCurrentPath()).toBe('/about/');
    });
  });

  test.describe('Navigation', () => {
    test('should generate links without prefix', async ({ app, I, I18n }) => {
      // Russian links
      await I18n.setLanguageCookie('ru', app.domain);
      await I.gotoPage(`${app.serverUrl}/`);

      const ruLinks = await I18n.getNavigationLinks();
      const noPrefix = ruLinks.every(
        (href) => !href.startsWith('/ru/') && !href.startsWith('/en/')
      );
      expect(noPrefix).toBe(true);

      // English links - should also have no prefix
      await I18n.setLanguageCookie('en', app.domain);
      await I.gotoPage(`${app.serverUrl}/`);

      const enLinks = await I18n.getNavigationLinks();
      const noPrefixEn = enLinks.every(
        (href) => !href.startsWith('/ru/') && !href.startsWith('/en/')
      );
      expect(noPrefixEn).toBe(true);
    });
  });
});
