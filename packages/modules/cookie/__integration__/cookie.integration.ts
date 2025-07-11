import { testChrome, testSafari, testSafariHttps, testFirefox } from './test-fixture';

testChrome.describe('packages/modules/cookie', async () => {
  testChrome('Check that the cookie module in Chrome is working', async ({ app, I, Cookie }) => {
    await I.gotoPage(app.serverUrl);

    await testChrome.expect(await Cookie.getTestCookie()).toBe(undefined);

    await Cookie.setTestCookie();

    await testChrome.expect(await Cookie.getTestCookie()).toBe('true');
  });

  testChrome(
    'Check that the cookie module in Chrome is working, secure',
    async ({ app, I, proxyServer, Cookie }) => {
      await I.gotoPage(`https://localhost:${proxyServer?.port}/`);

      await testChrome.expect(await Cookie.getTestCookie()).toBe(undefined);

      await Cookie.setTestCookie();

      await testChrome.expect(await Cookie.getTestCookie()).toBe('true');
    }
  );

  testChrome(
    'Check that the cookie module in Chrome can set and remove cookies',
    async ({ app, I, proxyServer, Cookie }) => {
      await I.gotoPage(app.serverUrl);

      await testChrome.expect(await Cookie.getTestCookie()).toBe(undefined);

      await Cookie.setTestCookie();

      await testChrome.expect(await Cookie.getTestCookie()).toBe('true');

      await Cookie.removeTestCookie();

      await testChrome.expect(await Cookie.getTestCookie()).toBe(undefined);
    }
  );
});

testSafari.describe('packages/modules/cookie', async () => {
  testSafari('Check that the cookie module in Safari is working', async ({ app, I, Cookie }) => {
    await I.gotoPage(app.serverUrl);

    await testSafari.expect(await Cookie.getTestCookie()).toBe(undefined);

    await Cookie.setTestCookie();

    await testSafari.expect(await Cookie.getTestCookie()).toBe('true');
  });

  testSafari(
    'Check that the cookie module in Safari can set and remove cookies',
    async ({ app, I, Cookie }) => {
      await I.gotoPage(app.serverUrl);

      await testSafari.expect(await Cookie.getTestCookie()).toBe(undefined);

      await Cookie.setTestCookie();

      await testSafari.expect(await Cookie.getTestCookie()).toBe('true');

      await Cookie.removeTestCookie();

      await testChrome.expect(await Cookie.getTestCookie()).toBe(undefined);
    }
  );
});

testSafariHttps.describe('packages/modules/cookie', async () => {
  testSafariHttps(
    'Check that the cookie module in Safari is working, secure',
    async ({ app, I, proxyServer, proxyStaticServer, Cookie }) => {
      await I.gotoPage(`https://localhost:${proxyServer?.port}/`);

      await testSafariHttps.expect(await Cookie.getTestCookie()).toBe(undefined);

      await Cookie.setTestCookie();

      await testSafariHttps.expect(await Cookie.getTestCookie()).toBe('true');
    }
  );
});

testFirefox.describe('packages/modules/cookie', async () => {
  testFirefox('Check that the cookie module in Firefox is working', async ({ app, I, Cookie }) => {
    await I.gotoPage(app.serverUrl);

    testFirefox.expect(await Cookie.getTestCookie()).toBe(undefined);

    await Cookie.setTestCookie();

    testFirefox.expect(await Cookie.getTestCookie()).toBe('true');
  });

  testFirefox(
    'Check that the cookie module in Firefox can set and remove cookies',
    async ({ app, I, Cookie }) => {
      await I.gotoPage(app.serverUrl);

      testFirefox.expect(await Cookie.getTestCookie()).toBe(undefined);

      await Cookie.setTestCookie();

      testFirefox.expect(await Cookie.getTestCookie()).toBe('true');

      await Cookie.removeTestCookie();

      testFirefox.expect(await Cookie.getTestCookie()).toBe(undefined);
    }
  );
});
