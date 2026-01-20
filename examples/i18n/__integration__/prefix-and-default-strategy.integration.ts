import { expect } from '@playwright/test';
import { testPrefixAndDefaultStrategy as test } from './test.fixture';

/**
 * Test suite for prefix_and_default routing strategy
 * Default language works with and without prefix: / or /ru/, /en/
 */
test.describe('i18n - Prefix and Default Routing Strategy', () => {
  test.beforeEach(async ({ I18n }) => {
    await I18n.setAcceptLanguageHeader('');
    await I18n.clearLanguageCookie();
  });

  test.describe('URL Structure', () => {
    test('should allow default language without prefix', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);
    });

    test('should allow default language with prefix', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/ru/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/ru/');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);
    });

    test('should require prefix for non-default languages', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/en/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toBe('/en/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });
  });

  test.describe('Language Switching', () => {
    test('should handle prefix changes when switching', async ({ app, I, I18n }) => {
      // Start without prefix (default language)
      await I.gotoPage(`${app.serverUrl}/`);

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/');

      // Switch to English - should add prefix
      await I18n.switchLanguage('en');

      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toBe('/en/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);

      // Switch back to Russian - prefix can be removed
      await I18n.switchLanguage('ru');

      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');
      expect(I18n.getCurrentPath()).toBe('/');
    });
  });

  test.describe('Navigation', () => {
    test('should generate links based on current URL variant', async ({ app, I, I18n }) => {
      // Default language without prefix
      await I.gotoPage(`${app.serverUrl}/`);

      const ruLinks = await I18n.getNavigationLinks();
      let hasNoPrefix = ruLinks.every(
        (href) => !href.startsWith('/ru/') && !href.startsWith('/en/')
      );
      expect(hasNoPrefix).toBe(true);

      await I18n.clearLanguageCookie();
      // Default language with prefix
      await I.gotoPage(`${app.serverUrl}/ru/`);

      const ruPrefixedLinks = await I18n.getNavigationLinks();
      hasNoPrefix = ruPrefixedLinks.every(
        (href) => !href.startsWith('/ru/') && !href.startsWith('/en/')
      );
      expect(hasNoPrefix).toBe(true);

      await I18n.clearLanguageCookie();
      // Non-default language requires prefix
      await I.gotoPage(`${app.serverUrl}/en/`);

      const enLinks = await I18n.getNavigationLinks();
      const hasEnPrefix = enLinks.every((href) => href.startsWith('/en/'));
      expect(hasEnPrefix).toBe(true);
    });
  });
});
