import { createToken, Scope } from '@tinkoff/dippy';
import { AsyncParallelTapableHookInstance, AsyncTapableHookInstance } from '@tinkoff/hook-runner';
import type {
  NavigationHook,
  AbstractRouter,
  NavigationSyncHook,
  Route,
  BackNavigationType,
  NavigationRoute,
} from '@tinkoff/router';
import type { RouteTransform } from '@tramvai/tokens-router';

export const routerClassToken =
  createToken<new (...args: ConstructorParameters<typeof AbstractRouter>) => AbstractRouter>(
    'router routerClassToken'
  );
export const additionalRouterParameters = createToken<Record<string, any>>(
  'router additionalParameters'
);

export const onChangeHooksToken = createToken<NavigationSyncHook>('router onChangeHooks', {
  multi: true,
});
export const beforeResolveHooksToken = createToken<NavigationHook>('router beforeResolveHooks', {
  multi: true,
});
export const beforeNavigateHooksToken = createToken<NavigationHook>('router beforeNavigateHooks', {
  multi: true,
});
export const afterNavigateHooksToken = createToken<NavigationHook>('router afterNavigateHooks', {
  multi: true,
});
export const beforeUpdateCurrentHooksToken = createToken<NavigationHook>(
  'router beforeUpdateCurrentHooks',
  { multi: true }
);
export const afterUpdateCurrentHooksToken = createToken<NavigationHook>(
  'router afterUpdateCurrentHooks',
  { multi: true }
);

export const routeTransformToken = createToken<RouteTransform>('router finalRouteTransform');

export const routerBundleInfoAdditionalToken = createToken<() => Promise<Route[]>>(
  'router bundleInfoAdditional',
  { scope: Scope.REQUEST }
);

export const ROUTER_VIEW_TRANSITIONS_ENABLED = createToken<boolean>(
  'router viewTransitionsEnabled'
);

export const BACK_NAVIGATION_WITHIN_ROUTE_TYPE = createToken<BackNavigationType>(
  'router backNavigationWithinRouteType'
);

export type PrerenderHooksToken = {
  'prerender:routes': AsyncParallelTapableHookInstance<string[]>;
  'prerender:generate': AsyncTapableHookInstance<NavigationRoute & { prerenderSkip?: boolean }>;
};

export const PRERENDER_HOOKS_TOKEN = createToken<PrerenderHooksToken>('tramvai prerender hooks', {
  scope: Scope.SINGLETON,
});
