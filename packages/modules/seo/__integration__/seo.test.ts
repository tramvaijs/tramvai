import { testApp } from '@tramvai/internal-test-utils/testApp';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import type { Page } from 'playwright-core';

import { jsonLd, stringifiedJSonLd, stringifiedUpdatedJSonLd, updatedJsonLd } from './data/jsonLd';

const checkRobotsMetaTagsCount = async (page: Page, robotsMetaTags: Record<string, number>) => {
  for (const [metaTagContent, expectedCount] of Object.entries(robotsMetaTags)) {
    expect(await page.locator(`meta[name="robots"][content="${metaTagContent}"]`).count()).toBe(
      expectedCount
    );
  }
};

describe('seo', () => {
  const { getApp } = testApp({
    name: 'seo',
  });

  describe('ssr', () => {
    const getHtml = async (url: string, withJsonLd = false) => {
      const app = getApp();

      const parsedOptions = withJsonLd
        ? { parserOptions: { blockTextElements: { script: true, style: false } } }
        : {};
      const { head, parsed } = await app.render(url, parsedOptions);

      return {
        head: head.replace(new RegExp(app.staticUrl, 'g'), 'http://localhost:4000'),
        jsonLd: parsed.querySelector('[type="application/ld+json"]')?.innerHTML,
      };
    };

    it('test robots skip meta', async () => {
      expect((await getHtml('/robots/skip/')).head).toMatchSnapshot();
    });

    it('test robots all meta', async () => {
      expect((await getHtml('/robots/all/')).head).toMatchSnapshot();
    });

    it('test default meta pack', async () => {
      expect((await getHtml('/seo/default/')).head).toMatchSnapshot();
    });

    it('test common meta', async () => {
      const { head, jsonLd } = await getHtml('/seo/common/', true);
      expect(head).toMatchSnapshot();
      expect(jsonLd).toMatchSnapshot();
    });

    it('test twitter meta', async () => {
      expect((await getHtml('/seo/twitter/')).head).toMatchSnapshot();
    });

    it('test og meta', async () => {
      expect((await getHtml('/seo/og/')).head).toMatchSnapshot();
    });

    it('test json-ld meta', async () => {
      const { jsonLd } = await getHtml('/seo/json-ld/', true);
      expect(jsonLd).toMatchSnapshot();
    });
  });

  describe('browser', () => {
    const jsonLdSelector = 'script[type="application/ld+json"]';

    const checkDynamicMeta = async (page: Page, expectedTitle: string, expectedJsonLd: string) =>
      page.waitForFunction(
        ([jsonLdSelector, expectedTitle, expectedJsonLd]) => {
          const jsonLdContent = document.querySelector(jsonLdSelector)?.textContent;
          return document.title === expectedTitle && jsonLdContent === expectedJsonLd;
        },
        [jsonLdSelector, expectedTitle, expectedJsonLd]
      );

    const { getPageWrapper } = testAppInBrowser(getApp);

    it('spa navigations should update meta tags', async () => {
      const { page, router } = await getPageWrapper('/seo/common/');

      expect(await page.title()).toBe('common seo');

      const commonJsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(commonJsonLdContent).toBe(stringifiedJSonLd);

      await router.navigate('../twitter');
      expect(await page.title()).toBe('twitter seo');
      const twitterJsonLd = await page.locator(jsonLdSelector).count();
      expect(twitterJsonLd).toBe(0);

      await router.navigate('../og');
      expect(await page.title()).toBe('og seo');
      const ogJsonLd = await page.locator(jsonLdSelector).count();
      expect(ogJsonLd).toBe(0);
    });

    it('should allow to update meta in page actions', async () => {
      const { page, router } = await getPageWrapper('/seo/dynamic/');

      expect(await page.title()).toBe('WoW, such dynamic!');
      expect(await page.locator('meta[name="robots"]').count()).toBe(0);

      const dynamicJsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(dynamicJsonLdContent).toBe(stringifiedUpdatedJSonLd);

      await router.navigate('../common/');
      expect(await page.title()).toBe('common seo');
      const commonJsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(commonJsonLdContent).toBe(stringifiedJSonLd);

      await router.navigate('../dynamic/');

      await checkDynamicMeta(page, 'WoW, such dynamic!', stringifiedUpdatedJSonLd);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should allow to update meta in browser page actions on first render', async () => {
      const { page, router } = await getPageWrapper('/seo/dynamic-client/');

      await checkDynamicMeta(page, 'WoW, such dynamic!', stringifiedUpdatedJSonLd);

      await router.navigate('../common/');

      await checkDynamicMeta(page, 'common seo', stringifiedJSonLd);

      await router.navigate('../dynamic-client/');

      await checkDynamicMeta(page, 'WoW, such dynamic!', stringifiedUpdatedJSonLd);
    });

    it('should have title which is came from the server action', async () => {
      const { page } = await getPageWrapper('/seo/dynamic-server/');

      await checkRobotsMetaTagsCount(page, { all: 1, 'index, follow': 1, noarchive: 1 });

      expect(await page.title()).toBe('Hello, this is Tramvai!');
      const jsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(jsonLdContent).toBe(stringifiedJSonLd);
    });

    it('should have title and jsonLd which are came from the server action and then be changed by the action on client', async () => {
      const { page } = await getPageWrapper('/seo/dynamic-server-dynamic-client');

      expect(await page.title()).toBe('Hello, this is Tramvai!');
      const jsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(jsonLdContent).toBe(stringifiedJSonLd);
      await checkRobotsMetaTagsCount(page, { all: 1, 'index, follow': 1, noarchive: 1 });

      await checkDynamicMeta(page, 'WoW, such dynamic!', stringifiedUpdatedJSonLd);
      await checkRobotsMetaTagsCount(page, { all: 0, 'index, follow': 0, noarchive: 0 });
    });

    it('ручное обновление robots meta tags', async () => {
      const { page } = await getPageWrapper('/seo/apply-meta');
      const button = page.getByTestId('apply-robots-skip-meta-button');

      await button.click();

      expect(await page.locator('meta[name="robots"]').count()).toBe(0);
    });

    it('после захода на страницу, ручное обновление через APPLY_META_TOKEN - старая мета обновилась если была изменена, мета из админки не пропала, если не была изменена, новая мета добавилась', async () => {
      const { page } = await getPageWrapper('/seo/apply-meta');

      const button = page.getByTestId('apply-new-meta-button');
      await button.click();

      // старый тайтл обновился
      expect(await page.title()).toBe('WoW, meta was applied!');

      // тэги из админки не пропали
      expect(await page.getAttribute('meta[name="viewport"]', 'content')).toBe('test viewport seo');

      // jsonLd из админки не пропал
      const jsonLdContent = await page.locator(jsonLdSelector).innerText();
      expect(jsonLdContent).toBe(stringifiedJSonLd);

      // новый мета тэг добавился
      expect(await page.getAttribute('meta[name="twitter:card"]', 'content')).toBe('twitter card');
    });
  });
});
