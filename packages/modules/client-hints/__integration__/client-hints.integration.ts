import { expect } from '@playwright/test';

import { sleep } from '@tramvai/test-integration';
import { testChrome, testSafari } from './test.fixture';
import {
  chromeClientHints,
  chromeCHUserAgent,
  chromeUserAgent,
  safariUserAgent,
} from './constants';

testChrome.describe('CSR Client Hints Module in Chrome', async () => {
  testChrome(
    'Provides full info from client hints if available',
    async ({ app, ClientHints, context }) => {
      await ClientHints.mockHighEntropyValues(() => Promise.resolve(chromeClientHints));
      const page = await context.newPage();

      await page.goto(app.serverUrl);

      testChrome.expect(await ClientHints.globalClientHints(page)).toEqual(chromeClientHints);
      testChrome.expect(await ClientHints.userAgentFromDI(page)).toEqual(chromeCHUserAgent);
    }
  );

  testChrome(
    'Fallbacks to user agent parsing if an error occurs during client-hints parsing',
    async ({ app, context, ClientHints }) => {
      await ClientHints.mockHighEntropyValues(() => {
        throw new Error('There is no client hints');
      });
      const page = await context.newPage();

      await page.goto(app.serverUrl);

      testChrome.expect(await ClientHints.userAgentFromDI(page)).toEqual(chromeUserAgent);
    }
  );

  testChrome(
    'Provides info about user screen in media store',
    async ({ app, context, ClientHints }) => {
      const page = await context.newPage();

      await page.goto(app.serverUrl);

      testChrome.expect(await ClientHints.mediaStore(page)).toEqual({
        height: expect.anything(),
        width: expect.anything(),
        isTouch: false,
        retina: false,
        synchronized: false,
        supposed: false,
        displayMode: 'browser',
      });
    }
  );

  testChrome('Correctly determines PWA display mode', async ({ app, context, ClientHints }) => {
    await ClientHints.mockDisplayMode('standalone');
    const page = await context.newPage();

    await page.goto(app.serverUrl);

    testChrome
      .expect(await ClientHints.mediaStore(page))
      .toEqual(expect.objectContaining({ displayMode: 'standalone' }));
  });

  testChrome('Correctly determines unknown display mode', async ({ app, context, ClientHints }) => {
    await ClientHints.mockDisplayMode('random');
    const page = await context.newPage();

    await page.goto(app.serverUrl);

    testChrome
      .expect(await ClientHints.mediaStore(page))
      .toEqual(expect.objectContaining({ displayMode: 'unknown' }));
  });

  testChrome('No hydration errors', async ({ app, context }) => {
    await context.clearCookies();

    const page = await context.newPage();
    const messages: string[] = [];

    page.on('console', (msg) => messages.push(msg.text()));

    await page.goto(`${app.serverUrl}/hydration-error/`, { waitUntil: 'load' });

    // wait for suspense hydration
    await sleep(500);

    testChrome
      .expect(messages.every((message) => !message.includes('hydrate:recover-after-error')))
      .toBe(true);
  });
});

testSafari.describe('CSR Client Hints Module', async () => {
  testSafari(
    'Fallbacks to user agent parsing, due to client hints are not supported in Safari',
    async ({ app, context, ClientHints }) => {
      const page = await context.newPage();

      await page.goto(app.serverUrl);

      testSafari.expect(await ClientHints.userAgentFromDI(page)).toEqual(safariUserAgent);
    }
  );
});
