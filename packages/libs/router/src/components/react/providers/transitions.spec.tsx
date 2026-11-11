/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import type { Navigation } from '../../../types';
import type { Router as BrowserRouter } from '../../../router/browser';

// React scheduler captures timers on import, so load it only after switching to real timers
jest.useRealTimers();
jest.resetModules();

process.env.__TRAMVAI_VIEW_TRANSITIONS = 'true';

/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');
const { render } = require('@testing-library/react');
const { parse } = require('@tinkoff/url');
const { Router } = require('../../../router/browser');
const { useRoute } = require('../useRoute');
const { useViewTransition } = require('../useViewTransition');
const { TransitionsProvider } = require('./transitions');
/* eslint-enable @typescript-eslint/no-var-requires */

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

describe('react/TransitionsProvider', () => {
  let router: BrowserRouter;
  let update: () => Promise<void>;
  let resolveFinished: () => void;
  let storeRoute: string;
  let storeListener: () => void;
  // every render of the page, with router state from different sources
  let renders: Array<{ context: string; store: string; last: string; isTransitioning: boolean }>;
  let domOnTransitionStart: string;

  const Page = () => {
    const route = useRoute();
    const store = React.useSyncExternalStore(
      (cb: () => void) => {
        storeListener = cb;
        return () => {};
      },
      () => storeRoute
    );
    const { isTransitioning } = useViewTransition('/child1/');

    renders.push({
      context: route.actualPath,
      store,
      last: router.getLastRoute().actualPath,
      isTransitioning,
    });

    return (
      <div id="page" className={isTransitioning ? 'transitioning' : ''}>
        {route.actualPath}
      </div>
    );
  };

  beforeEach(async () => {
    renders = [];
    storeRoute = '/';
    window.history.replaceState({}, '', '/');

    router = new Router({
      routes: [
        { name: 'root', path: '/' },
        { name: 'child1', path: '/child1/' },
      ],
      enableViewTransitions: true,
    });

    // same as RouterStore, updated in the `change` hook
    router.registerSyncHook('change', (navigation: Navigation) => {
      storeRoute = navigation.to.actualPath;
      storeListener?.();
    });

    await router.rehydrate({
      type: 'navigate',
      to: { name: 'root', path: '/', actualPath: '/', params: {} },
      url: parse('http://localhost/'),
    });
    await router.start();

    document.startViewTransition = jest.fn((cb: () => Promise<void>) => {
      domOnTransitionStart = document.body.innerHTML;

      return {
        ready: Promise.resolve(),
        finished: new Promise<void>((resolve) => {
          resolveFinished = resolve;
        }),
        updateCallbackDone: new Promise<void>((resolve) => {
          update = async () => {
            await cb();
            resolve();
          };
        }),
        skipTransition: jest.fn(),
      };
    }) as any;
  });

  afterEach(() => {
    router.unsubscribe();
    delete document.startViewTransition;
  });

  it('should render leaving page only with previous route state', async () => {
    const { container } = render(
      <TransitionsProvider router={router}>
        <Page />
      </TransitionsProvider>
    );

    // router updates React state outside of act, as in the real application
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;

    let navigated = false;

    router.navigate({ url: '/child1/', viewTransition: true }).then(() => {
      navigated = true;
    });

    await flush();

    expect(document.startViewTransition).toHaveBeenCalledTimes(1);
    // view transition state is applied to the leaving page before the snapshot
    expect(domOnTransitionStart).toContain('class="transitioning"');
    expect(navigated).toBe(false);
    expect(container.textContent).toBe('/');

    let updated = false;

    update().then(() => {
      updated = true;
    });

    await flush();

    expect(navigated).toBe(true);
    expect(updated).toBe(true);
    expect(container.textContent).toBe('/child1/');

    // leaving page was never rendered with the next route in store or router
    for (const item of renders.filter(({ context }) => context === '/')) {
      expect(item).toMatchObject({ store: '/', last: '/' });
    }

    resolveFinished();
    await flush();

    expect(container.querySelector('#page').className).toBe('');
  });
});
