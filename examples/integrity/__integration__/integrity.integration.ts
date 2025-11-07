import type { Page } from 'playwright-core';
import crypto from 'node:crypto';
import { test } from './integrity-fixture';

type windowWithObserver = typeof window & {
  scriptObserver: (src: string, integrity: string | null, crossOrigin: string | null) => void;
};

async function checkIntegrity(page: Page, src: string, integrity?: string) {
  const scriptContentResponse = await page.request.fetch(src);
  const scriptContent = await scriptContentResponse.text();
  const expectedIntegrity = crypto.createHash('sha256').update(scriptContent).digest('base64');
  test.expect(integrity).toEqual(`sha256-${expectedIntegrity}`);
}

test.describe('Script integrity tests', () => {
  test('test integrity existance', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, '/');
    const scripts = await page.$$eval('script[src]', (elements) =>
      elements.map((el) => ({
        src: el.getAttribute('src'),
        integrity: el.getAttribute('integrity'),
      }))
    );

    for (const script of scripts) {
      test.expect(script.integrity).not.toBeNull();
      await checkIntegrity(page, script.src!, script.integrity!);
    }
  });

  test('test crossorigin attribute for styles when integrity is present', async ({
    I,
    page,
    app,
  }) => {
    await I.gotoPage(app.serverUrl, '/');
    const styles = await page.$$eval('link[rel="stylesheet"]', (elements) =>
      elements.map((el) => ({
        href: el.getAttribute('href'),
        integrity: el.getAttribute('integrity'),
        crossorigin: el.getAttribute('crossorigin'),
      }))
    );

    for (const style of styles) {
      // When integrity is present, crossorigin should be 'anonymous'
      if (style.integrity) {
        test.expect(style.crossorigin).toEqual('anonymous');
      }
    }
  });

  test('sri hashes should be inside runtime chunk', async ({ page, app }) => {
    const { staticUrl } = app;
    const src = `${staticUrl}/dist/client/runtime.js`;
    const runtimeChunkResponse = await page.request.fetch(src);
    const runtimeChunkContent = await runtimeChunkResponse.text();

    test.expect(/__webpack_require__.sriHashes\s?=/m.test(runtimeChunkContent)).toBe(true);
  });

  test('test integrity for async webpack chunks', async ({ I, page, app }) => {
    const addedScripts: { src: string; integrity: string | null; crossOrigin: string | null }[] =
      [];

    await page.exposeFunction(
      'scriptObserver',
      (src: string, integrity: string | null, crossOrigin: string) => {
        addedScripts.push({ src, integrity, crossOrigin });
      }
    );

    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            // eslint-disable-next-line max-nested-callbacks
            mutation.addedNodes.forEach((node) => {
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                (node as Element).tagName === 'SCRIPT' &&
                (node as HTMLScriptElement).src
              ) {
                const script = node as HTMLScriptElement;
                (<windowWithObserver>window).scriptObserver(
                  script.src,
                  script.integrity,
                  script.crossOrigin
                );
              }
            });
          }
        });

        observer.observe(document.head, { childList: true });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    });

    await I.gotoPage(app.serverUrl, '/');
    await page.locator('#button').click();

    test.expect(addedScripts.length).toBeGreaterThan(0);

    for (const script of addedScripts) {
      // eslint-disable-next-line jest/no-standalone-expect
      test.expect(script.integrity).not.toBeNull();
      test.expect(script.crossOrigin).toBe('anonymous');
      await checkIntegrity(page, script.src, script.integrity!);
    }
  });
});
