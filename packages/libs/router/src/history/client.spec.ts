/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import { parse } from '@tinkoff/url';
import type { Navigation, NavigationRoute } from '../types';
import { ClientHistory } from './client';

/**
 * Mock global window.history.state handlers
 *
 * pushState, replaceState
 */
const pushStateMock = jest.fn();
const replaceStateMock = jest.fn();
window.history.pushState = pushStateMock;
window.history.replaceState = replaceStateMock;

/**
 * Test fixtures
 */
const rootRoute: NavigationRoute = {
  name: 'root',
  path: '/',
  actualPath: '/',
  params: {},
};
const rootUrl = parse('http://localhost');
const rootNavigateState = {
  key: 'root_navigate_state',
};

const childRoute: NavigationRoute = {
  name: 'child',
  path: '/child/',
  actualPath: '/child',
  params: {},
};
const childUrl = parse('http://localhost/child');

const lastRoute: NavigationRoute = {
  name: 'last',
  path: '/last/',
  actualPath: '/last',
  params: {},
};
const lastUrl = parse('http://localhost/last');

/**
 * Test scenarious
 */
describe('router/history client', () => {
  beforeEach(() => {
    pushStateMock.mockClear();
    replaceStateMock.mockClear();
  });

  it('should generate empty navigateState - in case with no from/fromUrl in navigation data', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      to: rootRoute,
      url: rootUrl,
    };

    history.init(navigation);

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: {},
      }),
      ''
    );
  });

  it('should generate with navigateState - in case with navigateState in navigation data', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      to: rootRoute,
      url: rootUrl,
      from: childRoute,
      fromUrl: childUrl,
      navigateState: rootNavigateState,
    };

    history.init(navigation);

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining(rootNavigateState),
      }),
      ''
    );
  });

  it('should generate navigationState with previousUrl - in case of fromUrl data', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousUrl: rootUrl,
        }),
      }),
      ''
    );
  });

  it('should generate navigationState with previousRoute - in case with from route data', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousRoute: rootRoute,
        }),
      }),
      ''
    );
  });

  it('should set previousRoute as a current route from which the normal transition occurred', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    history.save({
      type: 'navigate',
      from: childRoute,
      fromUrl: childUrl,
      to: lastRoute,
      url: lastUrl,
    });

    expect(pushStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousRoute: childRoute,
        }),
      }),
      '',
      lastRoute.actualPath
    );
  });

  it('should set previousUrl as a current route from which the normal transition occurred', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    history.save({
      type: 'navigate',
      from: childRoute,
      fromUrl: childUrl,
      to: lastRoute,
      url: lastUrl,
    });

    expect(pushStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousUrl: childUrl,
        }),
      }),
      '',
      lastRoute.actualPath
    );
  });

  it('should set previousRoute from a current route from which the replace transition occurred', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    history.save({
      type: 'navigate',
      from: childRoute,
      fromUrl: childUrl,
      to: lastRoute,
      url: lastUrl,
      replace: true,
    });

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousRoute: rootRoute,
        }),
      }),
      '',
      lastRoute.actualPath
    );
  });

  it('should set previousUrl from a current route from which the replace transition occurred', () => {
    const history = new ClientHistory();

    const navigation: Navigation = {
      type: 'navigate',
      from: rootRoute,
      fromUrl: rootUrl,
      to: childRoute,
      url: childUrl,
    };

    history.init(navigation);

    history.save({
      type: 'navigate',
      from: childRoute,
      fromUrl: childUrl,
      to: lastRoute,
      url: lastUrl,
      replace: true,
    });

    expect(replaceStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        navigateState: expect.objectContaining({
          previousUrl: rootUrl,
        }),
      }),
      '',
      lastRoute.actualPath
    );
  });
});
