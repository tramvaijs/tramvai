import { createMockRouter } from './router';

describe('test/unit/mocks/router', () => {
  it('should create router mock', () => {
    const router = createMockRouter();

    expect(router.getCurrentRoute()).toMatchObject({ path: '/' });
    expect(router.getCurrentUrl()).toMatchObject({ path: '/' });
  });

  it('should allow to specify currentRoute', () => {
    const router = createMockRouter({ currentRoute: { name: 'page', path: '/page/test/' } });

    expect(router.getCurrentRoute()).toMatchObject({ path: '/page/test/' });
    expect(router.getCurrentUrl()).toMatchObject({ path: '/page/test/' });
  });

  it('should support history navigation with back()', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.navigate('/page2');
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });
  });

  it('should support history navigation with forward()', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.navigate('/page2');
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.forward();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });
  });

  it('should support history navigation with go()', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate('/page3');

    expect(router.getCurrentRoute()).toMatchObject({ path: '/page3' });

    await router.go(-2);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.go(1);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });
  });

  it('should keep same route when calling go(0)', async () => {
    const router = createMockRouter();

    await router.navigate('/reload-test');
    await router.go(0);

    expect(router.getCurrentRoute()).toMatchObject({ path: '/reload-test' });
  });

  it('should do nothing when calling back() at the first history entry', async () => {
    const router = createMockRouter();
    const initialRoute = router.getCurrentRoute();

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject(initialRoute);
  });

  it('should do nothing when calling forward() at the last history entry', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    const currentRoute = router.getCurrentRoute();

    await router.forward();
    expect(router.getCurrentRoute()).toMatchObject(currentRoute);
  });

  it('should not navigate beyond history bounds', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');

    await router.go(-10);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });

    await router.go(10);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });
  });

  it('should clear forward history when navigating after going back', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate('/page3');

    await router.go(-2);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.navigate('/page4');

    await router.forward();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page4' });
  });

  it('should clear forward history when navigating with go() then navigate', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate('/page3');

    await router.go(-2);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.navigate('/page4');

    await router.go(1);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page4' });
  });

  it('should handle history navigation with same pathname (query change)', async () => {
    const router = createMockRouter();

    await router.navigate('/page?tab=1');
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page?tab=1' });

    await router.updateCurrentRoute({ query: { tab: '2' } });
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page?tab=2' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page?tab=1' });
    expect(router.getCurrentUrl()).toMatchObject({ query: { tab: '1' } });
  });

  it('should handle history navigation with hash change', async () => {
    const router = createMockRouter();

    await router.navigate('/page#section1');
    expect(router.getCurrentUrl()).toMatchObject({ hash: '#section1' });

    await router.updateCurrentRoute({ hash: '#section2' });
    expect(router.getCurrentUrl()).toMatchObject({ hash: '#section2' });

    await router.back();
    expect(router.getCurrentUrl()).toMatchObject({ hash: '#section1' });
  });

  it('should support manual replace navigation scenario', async () => {
    const router = createMockRouter();

    await router.navigate('/old-page');

    expect(router.getCurrentRoute()).toMatchObject({ path: '/old-page' });

    await router.navigate({ url: '/new-page', replace: true });

    expect(router.getCurrentRoute()).toMatchObject({ path: '/new-page' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/' });
  });

  it('should handle static redirect configuration', async () => {
    const router = createMockRouter({
      currentRoute: { name: 'redirected', path: '/new-page', redirect: '/new-page' } as any,
    });

    await router.navigate('/old-page');

    expect(router.getCurrentRoute()).toMatchObject({ path: '/new-page' });
  });

  it('should preserve history when using replace navigation', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate({ url: '/page3', replace: true });

    expect(router.getCurrentRoute()).toMatchObject({ path: '/page3' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.forward();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page3' });
  });

  it('should not clear forward history when using replace', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate('/page3');

    await router.go(-1);
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });

    await router.navigate({ url: '/pageX', replace: true });
    expect(router.getCurrentRoute()).toMatchObject({ path: '/pageX' });

    await router.forward();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page3' });
  });

  it('should handle multiple back navigations to initial state', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');
    await router.navigate('/page3');

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/' });
  });

  it('should not add new history entry when using updateCurrentRoute with replace', async () => {
    const router = createMockRouter();

    await router.navigate('/page1');
    await router.navigate('/page2');

    await router.updateCurrentRoute({ query: { updated: 'true' }, replace: true });
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page2?updated=true' });

    await router.back();
    expect(router.getCurrentRoute()).toMatchObject({ path: '/page1' });
  });
});
