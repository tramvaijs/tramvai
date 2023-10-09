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
