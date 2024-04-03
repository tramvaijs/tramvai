import { testChrome } from './fixture';

testChrome.describe('packages/modules/pwa-light', () => {
  testChrome.describe('Service Worker', () => {
    testChrome('should be registered with correct url', async ({ app, I }) => {
      await I.gotoPage(`${app.serverUrl}/`);
      const isHttpsEnvironment = app.serverUrl.startsWith('https://');
      testChrome.expect(isHttpsEnvironment).toBe(true);
    });
  });
});
