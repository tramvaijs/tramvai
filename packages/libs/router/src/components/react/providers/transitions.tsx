import type { FunctionComponent } from 'react';
import React, { useRef, useState } from 'react';
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

  // View transition state for context.
  const [viewTransitionState, setViewTransitionState] = useState<ViewTransitionState>({
    isTransitioning: false,
  });

  // Active view transition with promises, that resolves when the DOM updates.
  const viewTransition = useRef<{
    navigation: Navigation;
    started: Deferred<void>;
    updated: Deferred<void>;
  } | null>(null);

  const updateRouterState = (navigation: Navigation) => {
    startReactTransition(() => {
      setState({ route: navigation.to, url: navigation.url });
    });
  };

  useIsomorphicLayoutEffect(() => router.registerSyncHook('change', updateRouterState), [router]);

  // It's okay to ignore rules of hooks here, because this code
  // will not be a part of the bundle in case of truly condition
  if (process.env.__TRAMVAI_VIEW_TRANSITIONS === 'true') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsomorphicLayoutEffect(() => {
      const untapStart = router.internalHooks['router:view-transition-start'].tapPromise(
        'react-provider',
        async (_, navigation) => {
          // do not block update callback of the interrupted transition
          viewTransition.current?.updated.resolve();
          viewTransition.current = {
            navigation,
            started: new Deferred<void>(),
            updated: new Deferred<void>(),
          };

          setViewTransitionState({
            isTransitioning: true,
            currentRoute: navigation.from,
            nextRoute: navigation.to,
            types: navigation.viewTransitionTypes,
          });

          await viewTransition.current.started.promise;
        }
      );
      const untapUpdate = router.internalHooks['router:view-transition-update'].tapPromise(
        'react-provider',
        async (_, navigation) => {
          if (viewTransition.current?.navigation === navigation) {
            await viewTransition.current.updated.promise;
          }
        }
      );
      const untapEnd = router.internalHooks['router:view-transition-end'].tap(
        'react-provider',
        (_, navigation) => {
          // skipped transition can end after the start of the next one
          if (viewTransition.current?.navigation === navigation) {
            viewTransition.current.started.resolve();
            viewTransition.current.updated.resolve();
            viewTransition.current = null;
            setViewTransitionState({ isTransitioning: false });
          }
        }
      );

      return () => {
        untapStart();
        untapUpdate();
        untapEnd();
      };
    }, [router]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsomorphicLayoutEffect(() => {
      if (
        viewTransitionState.isTransitioning &&
        viewTransition.current?.navigation.to === viewTransitionState.nextRoute
      ) {
        viewTransition.current.started.resolve();
      }
    }, [viewTransitionState]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsomorphicLayoutEffect(() => {
      if (viewTransition.current?.navigation.to === state.route) {
        viewTransition.current.updated.resolve();
      }
    }, [state]);
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
