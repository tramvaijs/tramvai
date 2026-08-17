import type { Page } from '@playwright/test';

/**
 * Blocks every passed url part once, so the asset fails on the first request
 * and the retry script is triggered. Pass the same part twice to block two
 * requests in a row (the original request and the retry).
 *
 * Pass an empty list to only record the requests without blocking anything, which is
 * useful for assets that fail on their own (e.g. a url that does not exist).
 *
 * Note that blocked requests are fulfilled by playwright itself, so they never reach
 * the application static server or the fallback CDN proxy. Assert the number of attempts
 * on the returned list, and not on the requests recorded by the proxy.
 *
 * @returns the list of all urls requested by the page
 */
export const blockOnce = async (page: Page, urlParts: string[]) => {
  // duplicated parts are collapsed into a single entry with a counter,
  // so `['a.js', 'a.js']` blocks two requests to `a.js` in a row
  const blocked = urlParts.reduce<Map<string, number>>((acc, part) => {
    acc.set(part, (acc.get(part) ?? 0) + 1);
    return acc;
  }, new Map());

  const requested: string[] = [];

  await page.route('**/*', (route) => {
    const url = route.request().url();

    requested.push(url);

    for (const [part, count] of blocked) {
      if (count > 0 && url.includes(part)) {
        blocked.set(part, count - 1);
        return route.fulfill({ status: 500, contentType: 'text/plain', body: 'Error' });
      }
    }

    return route.continue();
  });

  return requested;
};

/**
 * Subscribes to uncaught errors inside the page and saves them to `window.__assetErrors`.
 *
 * The `pageerror` playwright event cannot be used here: it only transfers `message`/`stack`
 * and drops the custom fields (`code`, `retry`, `originalUrl`), which are exactly the
 * retry protocol that monitoring relies on. So the errors are collected in the browser.
 *
 * Only errors thrown by the retry script are collected. The listener is intentionally
 * not a capturing one, the same way as in the application monitoring module, so raw
 * resource load errors (which do not bubble) are not visible here.
 *
 * Must be called before `page.goto`.
 */
export const collectAssetErrors = async (page: Page) => {
  await page.addInitScript(() => {
    (window as any).__assetErrors = [];

    window.addEventListener('error', (event) => {
      const error = event.error as any;

      if (error) {
        (window as any).__assetErrors.push({
          message: error.message,
          code: error.code,
          retry: error.retry,
          originalUrl: error.originalUrl,
          newUrl: error.newUrl,
          xhrStatus: error.xhrStatus,
        });
      }
    });
  });
};

/** Reads the errors collected by {@link collectAssetErrors} */
export const getAssetErrors = (page: Page): Promise<Array<Record<string, any>>> =>
  page.evaluate(() => (window as any).__assetErrors ?? []);
