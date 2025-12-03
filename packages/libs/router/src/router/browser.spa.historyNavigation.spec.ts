/**
 * @jest-environment jsdom
 */
import { parse } from '@tinkoff/url';
import { Router } from './browser';
import { BackNavigationType } from '../types';

const routes = [
  {
    name: 'root',
    path: '/',
  },
  {
    name: 'test',
    path: '/test/',
  },
  {
    name: 'child1',
    path: '/child1/',
  },
  {
    name: 'child2',
    path: '/child2/',
  },
  {
    name: 'dynamic',
    path: '/dynamic/:id/:test?/',
  },
];

async function createRouter(popstateNavigationWithinRouteType: BackNavigationType) {
  const router = new Router({
    routes,
    backNavigationWithinRouteType: popstateNavigationWithinRouteType,
  });

  await router.rehydrate({
    type: 'navigate',
    to: { name: 'root', path: '/', actualPath: '/', params: {} },
    url: parse('http://localhost/'),
  });
  await router.start();

  return router;
}

describe('Test popstate nabigations', () => {
  describe('Test that back navigation has the same type as the one used to enter the page', () => {
    it('should trigger navigation when navigate page and returning via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/child1/');

      await router.navigate({ url: '/child1/', hash: 'hash' });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });

    it('should trigger update when when update page and returning via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });
      expect(beforeResolveHook).not.toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).toHaveBeenCalled();
    });

    it('should trigger navigation when navigate to the different page with replace and returning via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/test/');
      await router.navigate('/child1/');
      await router.navigate({ url: '/child2/', replace: true });

      await router.updateCurrentRoute({ hash: 'hash', replace: true });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child2/#hash' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/test/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });

    it('should trigger navigation when navigate to the same page and returning via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      await router.navigate('/child1/');

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });

    it('should trigger update when update to the same page and returning via "Browser Back" and go forward via "Browser Forward"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });

      await router.back();

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);
      await router.forward();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });
      expect(beforeResolveHook).not.toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).toHaveBeenCalled();
    });

    it('should trigger navigation when navigate to the same page and returning via "Browser Back" and go forward via "Browser Forward"', async () => {
      const router = await createRouter(BackNavigationType.CURRENT_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      await router.navigate('/child1/');

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });

      await router.back();

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);
      await router.forward();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });
  });
  describe('Test that back navigation has the previous history navigation type', () => {
    it('"Browser Back" should trigger navigation when previous page was navigated', async () => {
      const router = await createRouter(BackNavigationType.PREVIOUS_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });

    it('"Browser Back" should trigger update when previous page was updated', async () => {
      const router = await createRouter(BackNavigationType.PREVIOUS_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      await router.navigate('/child1/');

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });
      expect(beforeResolveHook).not.toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).toHaveBeenCalled();
    });

    it('"Browser Back" should trigger navigation when previous page was navigated with replace', async () => {
      const router = await createRouter(BackNavigationType.PREVIOUS_TYPE);

      await router.navigate('/test/');
      await router.navigate('/child1/');
      await router.navigate({ url: '/child2/', replace: true });

      await router.updateCurrentRoute({ hash: 'hash', replace: true });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child2/#hash' });

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);

      await router.back();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/test/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });

    it('"Browser Forward" should trigger update when current page was updated to and go back via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.PREVIOUS_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });

      await router.back();

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);
      await router.forward();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/#hash' });
      expect(beforeResolveHook).not.toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).toHaveBeenCalled();
    });

    it('"Browser Forward" should trigger navigation when current page was navigated to and go back via "Browser Back"', async () => {
      const router = await createRouter(BackNavigationType.PREVIOUS_TYPE);

      await router.navigate('/child1/');

      await router.updateCurrentRoute({ hash: 'hash' });

      await router.navigate('/child1/');

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });

      await router.back();

      const beforeResolveHook = jest.fn();
      const beforeUpdateCurrentHook = jest.fn();
      router.registerHook('beforeResolve', beforeResolveHook);
      router.registerHook('beforeUpdateCurrent', beforeUpdateCurrentHook);
      await router.forward();

      expect(router.getCurrentUrl()).toMatchObject({ path: '/child1/' });
      expect(beforeResolveHook).toHaveBeenCalled();
      expect(beforeUpdateCurrentHook).not.toHaveBeenCalled();
    });
  });
});
