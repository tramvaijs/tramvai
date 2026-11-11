/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import React, { useSyncExternalStore } from 'react';
import { render } from '@testing-library/react';
import { parse } from '@tinkoff/url';
import type { Navigation } from '../../../types';
import { Router } from '../../../router/browser';
import { useRoute } from '../useRoute';
import { useViewTransition } from '../useViewTransition';

process.env.__TRAMVAI_VIEW_TRANSITIONS = 'true';

// eslint-disable-next-line import/first
const { TransitionsProvider } = require('./transitions');

jest.useRealTimers();

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

describe('react/TransitionsProvider', () => {
  let router: Router;
  let update: () => Promise<void>;
  let resolveFinished: () => void;
  let storeRoute: string;
  let storeListener: () => void;
  // every render of the page, with router state from different sources
  let renders: Array<{ context: string; store: string; last: string; isTransitioning: boolean }>;
  let domOnTransitionStart: string;

  const Page = () => {
    const route = useRoute();
    const store = useSyncExternalStore(
      (cb) => {
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
