import { test } from './csr-router.fixture';

test.describe('CSR Router', () => {
  test('should render page', async ({ I, page, app, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');

    await page.waitForLoadState('networkidle');

    test.expect(await page.locator('#page').innerHTML()).toEqual('Default Page Component');
    test.expect(await page.locator('#route-name').innerHTML()).toEqual('root');
  });

  test('should not reload browser page', async ({ I, page, app, router, proxyServer }) => {
    const serverUrl = `http://localhost:${proxyServer.port}`;
    await I.gotoPage(serverUrl, '/');

    let loadCount = 0;

    page.on('load', () => {
      loadCount++;
    });

    await router.navigate('/test/');
    await router.navigate('/inner/page/');

    await page.goBack();
    await page.goForward();

    test.expect(page.url()).toEqual(`${serverUrl}/inner/page/`);
    test.expect(loadCount).toEqual(0);

    const routeName = await router.getRouteName();

    test.expect(routeName).toEqual('inner-page');
  });

  test('lazy components', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/lazy/');

    test.expect(await page.locator('#page').innerHTML()).toEqual('Lazy Page Component');
    test.expect(await page.locator('#route-name').innerHTML()).toEqual('lazy');
  });

  test('useRoute and useSelector should be in sync', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/useroute/1/');

    await router.navigate('../2');
    test.expect(await router.getUseRoute()).toEqual('/useroute/2/');

    await router.navigate('../3/');
    test.expect(await router.getPageTitle()).toEqual('UseRoute Page Component');

    await router.navigate('../2/');
    test.expect(await router.getUseRoute()).toEqual('/useroute/2/');
  });

  test('should redirect by static redirect', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/redirect/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    test.expect(page.url()).toEqual(`${serverUrl}/after/static/redirect/`);
  });

  test('should not preserve query on redirects by default', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/redirect/?a=1&b=2');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    test.expect(page.url()).toEqual(`${serverUrl}/after/static/redirect/`);
  });

  test('should preserve query on redirects if specified', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/redirect/query/?a=1&b=2');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    test.expect(page.url()).toBe(`${serverUrl}/after/static/redirect/?a=1&b=2`);
  });

  test('should redirect by actions', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/action/redirect/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/after/action/redirect/`);
  });

  test('should redirect by guard on spa', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.navigate('/redirect/guard/');

    await page.waitForURL(`${serverUrl}/test/`);
  });

  test('should change query by guard on spa', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/guard-query/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/guard-query/?test=test`);
  });

  test('should redirect while running commandline', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/redirect/commandline/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/after/commandline/redirect/`);
  });

  test('should use the same navigation type', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.navigate({ query: { a: '1' } });

    await router.checkLatestNavigationType('navigate');
    await page.goBack();

    await router.checkLatestNavigationType('navigate');

    await page.goForward();

    await router.checkLatestNavigationType('navigate');
    await page.waitForURL(`${serverUrl}/?a=1`);
  });

  test('should navigate by history', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.navigate('/inner/page/');
    await router.navigate('/test');
    await router.updateCurrentRoute({ query: { a: '1' } });
    await router.navigate('/test/');
    await router.navigate('/action/redirect/');

    page.waitForURL(`${serverUrl}/after/action/redirect/`);
    test.expect(await router.getUrlPath()).toBe('/after/action/redirect/');

    await page.goBack();
    await router.checkLatestNavigationType('navigate');

    await page.goBack();
    await router.checkLatestNavigationType('updateCurrentRoute');

    await page.waitForURL(`${serverUrl}/test/?a=1`);

    await page.reload();

    await page.goForward();
    await router.checkLatestNavigationType('updateCurrentRoute');

    await page.waitForURL(`${serverUrl}/test/`);
  });

  test('mix of navigate and updateCurrentRoute with replace', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.updateCurrentRoute({ replace: true, query: { a: '1' } });
    await router.navigate('/test/');
    await router.updateCurrentRoute({ replace: true, query: { b: '2' } });

    await page.goBack();
    await router.checkLatestNavigationType('navigate');

    await page.waitForURL(`${serverUrl}/?a=1`);

    test.expect(await router.getPageTitle()).toBe('Default Page Component');
  });

  test('mix of navigate and updateCurrentRoute with replace for the same route', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/dynamic/first/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.updateCurrentRoute({ replace: true, query: { a: '1' } });
    await router.navigate('/dynamic/second/');
    await router.updateCurrentRoute({ replace: true, query: { b: '2' } });

    await page.goBack();
    await router.checkLatestNavigationType('navigate');

    await page.waitForURL(`${serverUrl}/dynamic/first/?a=1`);

    test.expect(await router.getPageTitle()).toBe('Default Page Component');
  });

  test('should increment index in history state', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');

    await router.navigate('/test/');
    const historyState = await page.evaluate(() => window.history.state);

    test.expect(historyState).toMatchObject({ index: 1 });
  });

  test('should keep index in history state after page refresh', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');

    await router.navigate('/test/');
    await router.navigate('/dynamic/123/');

    await page.reload();

    const historyState = await page.evaluate(() => window.history.state);

    test.expect(historyState).toMatchObject({ index: 2 });
  });

  test('should decrement index in history state', async ({ I, router, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');

    await router.navigate('/test/');
    await router.navigate('/dynamic/123/');

    await page.goBack();

    const historyState = await page.evaluate(() => window.history.state);

    test.expect(historyState).toMatchObject({ index: 1 });
  });

  test('should navigate to historyFallback if history state is empty', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.navigate('/test/');
    await router.navigate('/dynamic/123/');

    await router.back();

    test.expect(page.url()).toBe(`${serverUrl}/test/`);

    await router.back();

    test.expect(page.url()).toBe(`${serverUrl}/`);

    test.expect(await router.getHistoryState()).toMatchObject({ index: 0 });

    await router.back();

    test.expect(await router.getHistoryState()).toMatchObject({ index: 0 });
    test.expect(page.url()).toBe(`${serverUrl}/history-fallback/`);
  });

  test('replace state internal', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history/replace-state/internal/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/history/replace-state/internal/?test=a`);

    test.expect(await page.evaluate(() => window.history.length)).toBe(2);
  });

  test('replace state external', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history/replace-state/external/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/test/`);

    test.expect(await page.evaluate(() => window.history.length)).toBe(2);
  });

  test('push state internal', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history/push-state/internal/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/history/push-state/internal/?test=a`);

    test.expect(await page.evaluate(() => window.history.length)).toBe(3);
  });

  test('push state external', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history/push-state/external/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/test/`);

    test.expect(await page.evaluate(() => window.history.length)).toBe(3);
  });

  test('replace state before rehydrate, same url, route is the same and fresh url is used', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history-before-init-same-url/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/history-before-init-same-url/?test=a`);

    test.expect((await router.getCurrentRoute()).name).toBe('history-before-init-same-url');
    test.expect((await router.getCurrentUrl()).pathname).toBe('/history-before-init-same-url/');
    test.expect((await router.getCurrentUrl()).search).toBe('?test=a');
  });

  test('replace state before rehydrate, new url, navigation is delayed and new route is used', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/history-before-init-new-url/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await page.waitForURL(`${serverUrl}/`);

    test.expect((await router.getCurrentRoute()).name).toBe('root');
    test.expect((await router.getCurrentUrl()).pathname).toBe('/');
  });

  test('navigate with query', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/dom/navigate/query/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await Promise.all([page.click('#button'), page.waitForNavigation()]);

    test.expect(page.url()).toBe(`${serverUrl}/dom/navigate/query/?test=b`);
    test.expect(await page.evaluate(() => window.history.length)).toBe(3);
  });

  test('navigate with hash', async ({ I, page, proxyServer }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/dom/navigate/hash/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await Promise.all([page.click('#button'), page.waitForNavigation()]);

    await page.waitForURL(`${serverUrl}/dom/navigate/hash/#test`);

    test.expect(await page.evaluate(() => window.history.length)).toBe(3);
  });

  test('history changes after current route updates with hash', async ({
    I,
    router,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/dom/navigate/hash/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    await router.updateCurrentRoute({ hash: 'foo' });

    await page.waitForURL(`${serverUrl}/dom/navigate/hash/#foo`);
    await router.updateCurrentRoute({ hash: 'bar' });

    await page.waitForURL(`${serverUrl}/dom/navigate/hash/#bar`);

    await page.evaluate(() => window.history.back());
    await page.waitForFunction(() => window.location.hash === '#foo');

    await page.waitForURL(`${serverUrl}/dom/navigate/hash/#foo`);
    test.expect((await router.getCurrentUrl()).hash).toBe(`#foo`);

    await page.evaluate(() => window.history.forward());
    await page.waitForFunction(() => window.location.hash === '#bar');

    await page.waitForURL(`${serverUrl}/dom/navigate/hash/#bar`);
    test.expect((await router.getCurrentUrl()).hash).toBe(`#bar`);
  });

  test('should use bundle scoped reducer on first render as well', async ({
    I,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/bundle-reducer/');
    const serverUrl = `http://localhost:${proxyServer.port}`;

    test
      .expect(await page.locator('#test-reducer-state').innerText())
      .toEqual('updated-from-initial');
  });

  test('should use fs-page scoped reducer on first render as well', async ({
    I,
    page,
    proxyServer,
  }) => {
    await I.gotoPage(`http://localhost:${proxyServer.port}`, '/page-reducer/');

    await page.waitForLoadState('networkidle');

    test
      .expect(await page.locator('#test-reducer-state').innerText())
      .toEqual('updated-from-initial');
  });
});
