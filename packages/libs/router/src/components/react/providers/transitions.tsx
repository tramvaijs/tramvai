import type { FunctionComponent } from 'react';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useIsomorphicLayoutEffect } from '@tinkoff/react-hooks';

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

  // Navigation with view transition started by the router.
  const viewTransitionNavigation = useRef<Navigation | null>(null);

  const updateRouterState = (navigation: Navigation) => {
    // inside the view transition update callback DOM should be updated synchronously
    if (viewTransitionNavigation.current === navigation) {
      flushSync(() => {
        setState({ route: navigation.to, url: navigation.url });
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
    useIsomorphicLayoutEffect(() => {
      const untapStart = router.internalHooks['router:view-transition-start'].tap(
        'react-provider',
        (_, navigation) => {
          viewTransitionNavigation.current = navigation;

          // leaving page should be rendered with actual view transition state before the snapshot
          flushSync(() => {
            setViewTransitionState({
              isTransitioning: true,
              currentRoute: navigation.from,
              nextRoute: navigation.to,
              types: navigation.viewTransitionTypes,
            });
          });
        }
      );
      const untapEnd = router.internalHooks['router:view-transition-end'].tap(
        'react-provider',
        (_, navigation) => {
          // skipped transition can end after the start of the next one
          if (viewTransitionNavigation.current === navigation) {
            viewTransitionNavigation.current = null;
            setViewTransitionState({ isTransitioning: false });
          }
        }
      );

      return () => {
        untapStart();
        untapEnd();
      };
    }, [router]);
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
