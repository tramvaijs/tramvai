import prop from '@tinkoff/utils/object/prop';

import {
  commandLineListTokens,
  DI_TOKEN,
  ExtractDependencyType,
  optional,
  provide,
  Scope,
  TAPABLE_HOOK_FACTORY_TOKEN,
  type Provider,
} from '@tramvai/core';
import {
  ASYNC_LOCAL_STORAGE_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { SERVER_MODULE_PAPI_PUBLIC_ROUTE } from '@tramvai/tokens-server';
import { ROUTER_TOKEN, ROUTES_TOKEN } from '@tramvai/tokens-router';
import { HttpError, makeErrorSilent } from '@tinkoff/errors';
import {
  additionalRouterParameters,
  PRERENDER_HOOKS_TOKEN,
  PrerenderHooksToken,
  routerBundleInfoAdditionalToken,
  routeTransformToken,
} from '../../tokens';
import { routerOptions } from './routerOptions';
import {
  bundleInfoExtendedPapi,
  bundleInfoPapi,
  deduplicateArray,
  resolveRoutes,
  prerenderRoutesPapi,
} from './bundleInfo';
import { prefetchProviders } from './prefetch';

declare module '@tramvai/tokens-common' {
  export interface AsyncLocalStorageState {
    tramvaiRequestDi?: ExtractDependencyType<typeof DI_TOKEN>;
  }
}

const DYNAMIC_PAGE_REGEX = /\/:.+\//g;

export const serverTokens: Provider[] = [
  {
    provide: additionalRouterParameters,
    useFactory: routerOptions,
    deps: {
      requestManager: REQUEST_MANAGER_TOKEN,
      responseManager: RESPONSE_MANAGER_TOKEN,
    },
  },
  {
    provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
    scope: Scope.SINGLETON,
    multi: true,
    useValue: bundleInfoPapi,
  },
  {
    provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
    scope: Scope.SINGLETON,
    multi: true,
    useValue: bundleInfoExtendedPapi,
  },
  {
    provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
    scope: Scope.SINGLETON,
    multi: true,
    useValue: prerenderRoutesPapi,
  },
  provide({
    provide: PRERENDER_HOOKS_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ hooksFactory }) =>
      ({
        'prerender:routes': hooksFactory.createAsyncParallel('prerender:routes'),
        'prerender:generate': hooksFactory.createAsync('prerender:generate'),
      }) satisfies PrerenderHooksToken,
    deps: {
      hooksFactory: TAPABLE_HOOK_FACTORY_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ hooks, storage }) => {
      return function registerPrerenderRoutesHook() {
        hooks['prerender:routes'].tapPromise('RouterPrerenderPlugin', async (_, routes) => {
          const di = storage.getStore()?.tramvaiRequestDi;

          if (di) {
            // we need to resolve request scope provider from child di container,
            // `tramvaiRequestDi` will be available in papi handlers
            const paths = await resolveRoutes({
              routes: di.get(optional(ROUTES_TOKEN)),
              getAdditionalRoutes: di.get(optional(routerBundleInfoAdditionalToken)),
              routeTransform: di.get(routeTransformToken),
            });

            routes.push(
              ...deduplicateArray(
                paths.map(prop('path')).filter((path) => !DYNAMIC_PAGE_REGEX.test(path))
              ).sort()
            );
          }
        });
      };
    },
    deps: {
      hooks: PRERENDER_HOOKS_TOKEN,
      storage: ASYNC_LOCAL_STORAGE_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.resolvePageDeps,
    useFactory: ({ router, requestManager, responseManager, hooks }) => {
      return async function callPrerenderGenerateHook() {
        if (requestManager.getHeader('x-tramvai-prerender') === 'true') {
          const route = { ...router.getCurrentRoute(), prerenderSkip: false };

          await hooks['prerender:generate'].callPromise(route);

          if (route.prerenderSkip) {
            responseManager.setHeader('x-tramvai-prerender-skip', 'true');

            const error = new HttpError({
              url: requestManager.getUrl(),
              message: `Prerendering for route "${route.path}" was skipped`,
            });

            makeErrorSilent(error);

            throw error;
          }
        }
      };
    },
    deps: {
      router: ROUTER_TOKEN,
      requestManager: REQUEST_MANAGER_TOKEN,
      responseManager: RESPONSE_MANAGER_TOKEN,
      hooks: PRERENDER_HOOKS_TOKEN,
    },
  }),
  ...prefetchProviders,
];
