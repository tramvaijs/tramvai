import flatten from '@tinkoff/utils/array/flatten';
import prop from '@tinkoff/utils/object/prop';

import { createPapiMethod } from '@tramvai/papi';
import { ROUTES_TOKEN } from '@tramvai/tokens-router';
import { isWildcard, isHistoryFallback, Route } from '@tinkoff/router';
import { ExtractDependencyType } from '@tinkoff/dippy';
import { PRERENDER_HOOKS_TOKEN, routeTransformToken } from '../../tokens';
import { routerBundleInfoAdditionalToken } from '../../tokens';

export const deduplicateArray = <T>(list: T[]): T[] => {
  return Array.from(new Set(list));
};

export const resolveRoutes = async ({
  getAdditionalRoutes,
  routes,
  routeTransform,
}: {
  routes: ExtractDependencyType<typeof ROUTES_TOKEN>;
  routeTransform: ExtractDependencyType<typeof routeTransformToken>;
  getAdditionalRoutes?: ExtractDependencyType<typeof routerBundleInfoAdditionalToken>;
}) => {
  const loadAdditional = getAdditionalRoutes ?? (() => []);
  const additionalRoutes = (await loadAdditional()) ?? [];

  return flatten(routes || [])
    .concat(additionalRoutes)
    .map(routeTransform)
    .filter((route) => !isWildcard(route.path) && !isHistoryFallback(route.path));
};

export const bundleInfoExtendedPapi = createPapiMethod({
  method: 'get',
  path: '/bundleInfoExtended',
  async handler() {
    const routesList = await resolveRoutes(this.deps);

    return routesList.sort((a: Route, b: Route) => {
      if (a.path < b.path) {
        return -1;
      }
      if (a.path > b.path) {
        return 1;
      }
      return 0;
    });
  },
  deps: {
    routes: {
      token: ROUTES_TOKEN,
      optional: true,
    },
    routeTransform: routeTransformToken,
    getAdditionalRoutes: { token: routerBundleInfoAdditionalToken, optional: true },
  },
});

export const bundleInfoPapi = createPapiMethod({
  method: 'get',
  path: '/bundleInfo',
  async handler() {
    const routesList = await resolveRoutes(this.deps);

    return deduplicateArray(routesList.map(prop('path'))).sort();
  },
  deps: {
    routes: {
      token: ROUTES_TOKEN,
      optional: true,
    },
    routeTransform: routeTransformToken,
    getAdditionalRoutes: { token: routerBundleInfoAdditionalToken, optional: true },
    hooks: PRERENDER_HOOKS_TOKEN,
  },
});

export const prerenderRoutesPapi = createPapiMethod({
  method: 'get',
  path: '/prerenderRoutes',
  async handler() {
    const routesList: string[] = [];

    await this.deps.hooks['prerender:routes'].callPromise(routesList);

    return routesList;
  },
  deps: {
    hooks: PRERENDER_HOOKS_TOKEN,
  },
});
