import type { FunctionComponent } from 'react';
import React, { useEffect, useState } from 'react';
import { useIsomorphicLayoutEffect } from '@tinkoff/react-hooks';
import { Deferred } from '@tramvai/core';

import type { ViewTransitionState } from '../context';
import { RouteContext, RouterContext, UrlContext, ViewTransitionContext } from '../context';
import type { Navigation } from '../../../types';
import type { RouterProviderProps, RouterState } from './types';

let startTransition;

try {
  // eslint-disable-next-line import/no-unresolved, import/extensions
  startTransition = require('react').startTransition;
} catch {}

export const startReactTransition =
  typeof startTransition === 'function' && process.env.__TRAMVAI_REACT_TRANSITIONS === 'true'
    ? startTransition
    : (fn: () => void) => {
        fn();
      };

export const TransitionsProvider: FunctionComponent<RouterProviderProps> = ({
  router,
  children,
}) => {
  // fallback to outdated router implementation
  const [state, setState] = useState<RouterState>(() => ({
    route: router.getLastRoute() ?? router.getCurrentRoute(),
    url: router.getLastUrl() ?? router.getCurrentUrl(),
  }));

  // Router state that will be applied to the DOM.
  const [pendingState, setPendingState] = useState<RouterState | null>(null);

  // View transition state for context.
  const [viewTransitionState, setViewTransitionState] = useState<ViewTransitionState>({
    isTransitioning: false,
  });

  // Deferred render promise, that resolves when the DOM updates after a navigation.
  const [renderDeferred, setRenderDeferred] = useState<Deferred<void> | null>(null);

  const updateRouterState = (navigation: Navigation) => {
    if (document.startViewTransition !== undefined && navigation.viewTransition) {
      setPendingState({ route: navigation.to, url: navigation.url });

      setViewTransitionState({
        isTransitioning: true,
        currentRoute: navigation.from,
        nextRoute: navigation.to,
      });

      return;
    }

    startReactTransition(() => {
      setState({ route: navigation.to, url: navigation.url });
    });
  };

  useIsomorphicLayoutEffect(() => router.registerSyncHook('change', updateRouterState), [router]);

  // It's okay to ignore rules of hooks here, because this code
  // will not be a part of the bundle in case of truly condition
  if (process.env.__TRAMVAI_VIEW_TRANSITIONS === 'true') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (viewTransitionState.isTransitioning) {
        setRenderDeferred(new Deferred<void>());
      }
    }, [viewTransitionState.isTransitioning]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (renderDeferred !== null && pendingState !== null) {
        const transition = document.startViewTransition(async () => {
          startReactTransition(() => {
            setState(pendingState);
          });

          await renderDeferred.promise;
        });

        // eslint-disable-next-line promise/catch-or-return
        transition.finished.finally(() => {
          setRenderDeferred(null);
          setPendingState(null);
          setViewTransitionState({ isTransitioning: false });
        });
      }
    }, [pendingState, renderDeferred]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (
        renderDeferred !== null &&
        pendingState !== null &&
        state.route.actualPath === pendingState.route.actualPath
      ) {
        renderDeferred.resolve();
      }
    }, [state, renderDeferred, pendingState]);
  }

  return (
    <RouterContext.Provider value={router}>
      <RouteContext.Provider value={state.route}>
        <UrlContext.Provider value={state.url}>
          <ViewTransitionContext.Provider value={viewTransitionState}>
            {children}
          </ViewTransitionContext.Provider>
        </UrlContext.Provider>
      </RouteContext.Provider>
    </RouterContext.Provider>
  );
};

TransitionsProvider.displayName = 'TinkoffRouterTransitionsProvider';
