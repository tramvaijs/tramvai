import { expect } from '@playwright/test';
import { test } from './test.fixture';

/**
 * Test suite for default i18n configuration
 * - routingStrategy: prefix_except_default
 * - updateStrategy: reload
 * - defaultLanguage: ru
 * - availableLanguages: ru, en
 */
test.describe('i18n - Default Configuration', () => {
  test.beforeEach(async ({ I18n }) => {
    await I18n.setAcceptLanguageHeader('');
    await I18n.clearLanguageCookie();
  });

  test.describe('Language Detection', () => {
    test('should use default language on first visit', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);
    });

    test('should detect language from cookie', async ({ app, I, I18n }) => {
      await I18n.setLanguageCookie('en', app.domain);
      await I.gotoPage(`${app.serverUrl}/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should detect language from Accept-Language header', async ({ app, I, I18n }) => {
      await I18n.setAcceptLanguageHeader('en-US,en;q=0.9');
      await I.gotoPage(`${app.serverUrl}/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should detect language from URL prefix', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/en/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should prioritize cookie over Accept-Language header', async ({ app, I, I18n }) => {
      await I18n.setLanguageCookie('ru', app.domain);
      await I18n.page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
      await I.gotoPage(`${app.serverUrl}/`);

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);
    });
  });

  test.describe('Language Switching', () => {
    test('should switch language and reload page', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      // Initial language should be Russian
      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);

      // Switch to English
      await I18n.switchLanguage('en');

      // After reload, language should be English
      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });

    test('should update URL with language prefix', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      // Initial URL should have no prefix (default language)
      expect(I18n.getCurrentPath()).toBe('/');

      // Switch to English
      await I18n.switchLanguage('en');

      // URL should now have /en/ prefix
      expect(I18n.getCurrentPath()).toMatch(/^\/en\//);
    });

    test('should preserve route path and query parameters', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/about/?foo=bar`);

      expect(I18n.getCurrentPath()).toBe('/about/');

      // Switch to English
      await I18n.switchLanguage('en');

      // URL should be /en/about/ with query params
      expect(I18n.getCurrentPath()).toBe('/en/about/');
      expect(new URL(I18n.page.url()).search).toBe('?foo=bar');
    });
  });

  test.describe('Navigation', () => {
    test('should maintain language when navigating', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/en/`);

      const lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      await I18n.clickAboutLink();

      expect(I18n.getCurrentPath()).toBe('/en/about/');
    });

    test('should update navigation links with language prefix', async ({ app, I, I18n }) => {
      // Navigate to English
      await I.gotoPage(`${app.serverUrl}/en/`);

      const links = await I18n.getNavigationLinks();
      const hasEnPrefix = links.every((href) => href.startsWith('/en/'));
      expect(hasEnPrefix).toBe(true);

      // Switch to Russian (default)
      await I18n.switchLanguage('ru');

      const ruLinks = await I18n.getNavigationLinks();
      const hasNoPrefix = ruLinks.every(
        (href) => !href.startsWith('/en/') && !href.startsWith('/ru/')
      );
      expect(hasNoPrefix).toBe(true);
    });
  });

  test.describe('SEO', () => {
    test('should set html lang attribute', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      let langAttr = await I18n.getHtmlLangAttribute();
      expect(langAttr).toBe('ru');

      await I18n.switchLanguage('en');

      langAttr = await I18n.getHtmlLangAttribute();
      expect(langAttr).toBe('en');
    });
  });

  test.describe('Configuration', () => {
    test('should display configuration in footer', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      const routingStrategy = await I18n.getRoutingStrategy();
      expect(routingStrategy).toBe('prefix_except_default');

      const updateStrategy = await I18n.getUpdateStrategy();
      expect(updateStrategy).toBe('reload');

      const currentLang = await I18n.getCurrentLanguageFromFooter();
      expect(currentLang).toBe('ru');
    });
  });
});
