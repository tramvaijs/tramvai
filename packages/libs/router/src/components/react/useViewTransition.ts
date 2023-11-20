import { useContext } from 'react';

import type { AbstractRouter } from '../../router/abstract';
import type { NavigateOptions } from '../../types';
import { ViewTransitionContext, RouterContext } from './context';

type Payload = string | Partial<NavigateOptions>;

const normalizePath = (payload: Payload, router: AbstractRouter): string => {
  const route = router.resolve(payload);
  const resolvedPath =
    route.redirect !== undefined ? router.resolve(route.redirect).actualPath : route.actualPath;

  return resolvedPath.endsWith('/') ? resolvedPath : `${resolvedPath}/`;
};

export const useViewTransition = (payload: Payload): boolean => {
  const viewTransition = useContext(ViewTransitionContext);
  const router = useContext(RouterContext);

  if (viewTransition.isTransitioning) {
    const path = normalizePath(payload, router);
    const currentPath = viewTransition.currentRoute.actualPath;
    const nextPath = viewTransition.nextRoute.actualPath;

    // We are handling forward and back navigations for the same route here
    return [currentPath, nextPath].includes(path);
  }

  return false;
};
