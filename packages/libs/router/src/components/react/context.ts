import { createContext } from 'react';
import type { Url } from '@tinkoff/url';
import type { AbstractRouter } from '../../router/abstract';
import type { NavigationRoute } from '../../types';

export const RouterContext = createContext<AbstractRouter>(null);
export const RouteContext = createContext<NavigationRoute>(null);
export const UrlContext = createContext<Url>(null);

export type ViewTransitionState =
  | {
      isTransitioning: false;
    }
  | {
      isTransitioning: true;
      currentRoute: NavigationRoute;
      nextRoute: NavigationRoute;
      types?: string[];
    };

export const ViewTransitionContext = createContext<ViewTransitionState>({
  isTransitioning: false,
});
