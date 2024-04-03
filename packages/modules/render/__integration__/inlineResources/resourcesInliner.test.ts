import type { Page } from '@playwright/test';
import { testApp } from '@tramvai/internal-test-utils/testApp';
import { teremock } from '@tramvai/internal-test-utils/mock-server/client';
import { addMock } from '@tramvai/internal-test-utils/shared/interceptor';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';
import type { mockEnv } from '@tramvai/internal-test-utils/mock-server/mockEnv';

const getLinks = (page: Page) => {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')).map(
      (link) => link.href
    );
  });
};

const getStyles = (page: Page) => {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('style')).map(
      (style: HTMLStyleElement) => style.innerText
    );
  });
};

const getResourceFromMock = (teremockUrl: string, resourcePath: string) =>
  `${teremockUrl}/${'resources' as keyof typeof mockEnv}${resourcePath}`;

const resourcePath = '/123.css';

describe('resources inliner', () => {
  const { getApp, getMockerUrl } = testApp({
    name: 'render-inline-resource',
  });
  const { getPageWrapper } = testAppInBrowser(getApp);

  it('should not inline bad requests', async () => {
    teremock.add({
      url: resourcePath,
      response: {
        body: 'some non-css stuff',
        status: 504,
      },
    });

    const { page } = await getPageWrapper();

    page.route('**/*', (route) => {
      if (route.request().url() === getResourceFromMock(getMockerUrl(), resourcePath)) {
        route.fulfill({
          body: '',
          status: 200,
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`${getApp().serverUrl}/`);

    const links = await getLinks(page);
    const styles = await getStyles(page);

    // Первый запуск, кеши ещё не прогреты, CSS не должен инлайниться.
    expect(links).toEqual([
      `${getApp().staticUrl}/dist/client/root.chunk.css`,
      getResourceFromMock(getMockerUrl(), resourcePath),
    ]);
    expect(styles).toMatchInlineSnapshot(`[]`);

    await page.reload();

    const linksAfterReload = await getLinks(page);
    const stylesAfterReload = await getStyles(page);
    const dataHrefLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-href]'));
    });
    const body = await page.evaluate(() => document.querySelector('body')?.outerHTML);
    expect(body).not.toContain('some non-css stuff');

    // из-за добавления хешей в название css-классов нельзя сделать полный снапшот
    expect(stylesAfterReload.toString()).toContain('.root__main_');
    expect(stylesAfterReload.toString()).toContain('padding: 3px;');

    expect(linksAfterReload).toContain(getResourceFromMock(getMockerUrl(), resourcePath));
    expect(linksAfterReload).not.toContain(`${getApp().staticUrl}/dist/client/root.chunk.css`);
    expect(dataHrefLinks.length).not.toBe(0);
  });
});

describe('resources inliner source-map', () => {
  const sourceMapComment = '//# sourceMappingURL=123.css.map';
  const sourceStyles = 'background-color: yellow;';
  const mockedResponse = `.sourcemapstyles { ${sourceStyles} }\n${sourceMapComment}`;

  const { getApp, getMockerUrl } = testApp({
    name: 'render-inline-resource',
  });
  const { getPageWrapper } = testAppInBrowser(getApp);
  it('should remove sourceMappingURL when inlining', async () => {
    const { page } = await getPageWrapper();

    await addMock({
      url: `123.css`,
      response: {
        body: mockedResponse,
        status: 200,
      },
    });

    await page.route('**/*', (route) => {
      if (route.request().url() === getResourceFromMock(getMockerUrl(), resourcePath)) {
        route.fulfill({
          body: mockedResponse,
          status: 200,
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`${getApp().serverUrl}/sourcemap/`);

    {
      const styles = await getStyles(page);
      expect(styles).toMatchInlineSnapshot(`[]`);
    }

    await page.reload();

    {
      const styles = await getStyles(page);
      const joinedToStringStyles = styles.toString();
      expect(joinedToStringStyles).toContain(sourceStyles);
      expect(joinedToStringStyles).not.toContain(sourceMapComment);
    }
  });
});
