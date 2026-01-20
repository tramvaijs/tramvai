import { expect } from '@playwright/test';
import { testUpdateStrategy as test } from './test.fixture';

/**
 * Test suite for update strategy (SPA transitions)
 * Language switching uses SPA navigation instead of page reload
 */
test.describe('i18n - Update Strategy (SPA)', () => {
  test.beforeEach(async ({ I18n }) => {
    await I18n.setAcceptLanguageHeader('');
    await I18n.clearLanguageCookie();
  });

  test.describe('Language Switching without Reload', () => {
    test('should not reload page when switching language', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('ru');

      let spaCounter = await I18n.page.evaluate(() => {
        return (window as any).__counter;
      });
      expect(spaCounter).toBe(1);

      await I18n.switchLanguage('en');

      spaCounter = await I18n.page.evaluate(() => {
        return (window as any).__counter;
      });
      expect(spaCounter).toBe(2);

      // Language should have changed without reload
      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);

      // URL should be updated
      expect(I18n.getCurrentPath()).toMatch(/^\/en\//);
    });
  });

  test.describe('Component Updates', () => {
    test('should update content and links without reload', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      const hasRussian = await I18n.hasRussianContent();
      expect(hasRussian).toBe(true);

      // Get initial links
      const ruLinks = await I18n.getNavigationLinks();
      const hasNoPrefix = ruLinks.every(
        (href) => !href.startsWith('/en/') && !href.startsWith('/ru/')
      );
      expect(hasNoPrefix).toBe(true);

      // Switch language using SPA
      await I18n.switchLanguage('en');

      // Content should be updated
      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);

      // Links should be updated with language prefix
      const enLinks = await I18n.getNavigationLinks();
      const hasEnPrefix = enLinks.every((href) => href.startsWith('/en/'));
      expect(hasEnPrefix).toBe(true);
    });
  });

  test.describe('Navigation with Update Strategy', () => {
    test('should maintain language during SPA navigation', async ({ app, I, I18n }) => {
      await I.gotoPage(`${app.serverUrl}/`);

      // Switch to English without reload
      await I18n.switchLanguage('en');

      let lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toMatch(/^\/en\//);

      // Navigate to another page using SPA
      await I18n.clickAboutLink();

      // Language should be maintained
      lang = await I18n.getLanguageCookie();
      expect(lang).toBe('en');
      expect(I18n.getCurrentPath()).toBe('/en/about/');

      const hasEnglish = await I18n.hasEnglishContent();
      expect(hasEnglish).toBe(true);
    });
  });

  // TODO: do we really need to update i18n meta at SPA navigation?
  // test.describe('SEO Updates', () => {
  //   test('should update html lang attribute without reload', async ({ app, I, I18n }) => {
  //     await I.gotoPage(`${app.serverUrl}/`);

  //     let langAttr = await I18n.getHtmlLangAttribute();
  //     expect(langAttr).toBe('ru');

  //     // Switch to English using SPA
  //     await I18n.switchLanguage('en');

  //     // HTML lang attribute should be updated
  //     langAttr = await I18n.getHtmlLangAttribute();
  //     expect(langAttr).toBe('en');

  //     const lang = await I18n.getLanguageCookie();
  //     expect(lang).toBe('en');
  //   });

  //   test('should maintain lang attribute during SPA navigation', async ({ app, I, I18n }) => {
  //     await I.gotoPage(`${app.serverUrl}/`);

  //     // Switch to English
  //     await I18n.switchLanguage('en');

  //     let langAttr = await I18n.getHtmlLangAttribute();
  //     expect(langAttr).toBe('en');

  //     // Navigate to another page
  //     await I18n.clickAboutLink();

  //     // Lang attribute should be maintained
  //     langAttr = await I18n.getHtmlLangAttribute();
  //     expect(langAttr).toBe('en');
  //   });
  // });

  test.describe('Edge Cases', () => {
    test('should handle SPA navigation on routes with different prefixes', async ({
      app,
      I,
      I18n,
      tramvai,
    }) => {
      // Test on home page
      await I.gotoPage(`${app.serverUrl}/`);

      await I18n.switchLanguage('en');

      expect(I18n.getCurrentPath()).toMatch(/^\/en\//);

      // Navigate to about page
      await tramvai.spaNavigate(`/about/`);
      await I18n.page.waitForURL((url) => url.pathname === '/en/about/', { timeout: 1000 });

      expect(I18n.getCurrentPath()).toBe('/en/about/');
    });
  });
});
