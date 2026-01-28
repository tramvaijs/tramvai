import type { Route } from '@tinkoff/router';
import type { ExtractDependencyType, Provider } from '@tramvai/core';
import { commandLineListTokens, provide } from '@tramvai/core';
import { stopRunAtError } from '@tramvai/module-router';
import { resolveLazyComponent } from '@tramvai/react';
import type { ChildAppRequestConfig } from '@tramvai/tokens-child-app';
import {
  CHILD_APP_PRELOAD_MANAGER_TOKEN,
  CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
} from '@tramvai/tokens-child-app';
import { LINK_PREFETCH_HANDLER_TOKEN, PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

const pagePreload = async (
  {
    preloadManager,
    preloadSourceList,
  }: {
    preloadManager: typeof CHILD_APP_PRELOAD_MANAGER_TOKEN;
    preloadSourceList: ExtractDependencyType<typeof CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN>;
  },
  mode: 'prefetch' | 'preload',
  isSpaNavigation = false,
  route?: Route
): Promise<void> => {
  const childApps: ChildAppRequestConfig[] = (
    await Promise.all(
      preloadSourceList.map((source) => {
        return source({ route });
      })
    )
  ).reduce((acc, source) => acc.concat(source), []);

  await Promise.all(
    childApps.map((request) => {
      // for first preload on SPA-navigation, we need to prevent double action execution,
      // and need to mark this Child App as not preloaded, to prevent running `spa` and `afterSpa` commands for it
      if (mode === 'preload' && isSpaNavigation && !preloadManager.isPreloaded(request)) {
        preloadManager.saveNotPreloadedForSpaNavigation(request);
      }

      return preloadManager[mode](request, route).catch((error) => {
        if (stopRunAtError(error)) {
          throw error;
        }
      });
    })
  );
};

export const pagePreloadProviders: Provider[] = [
  provide({
    provide: CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
    useFactory: ({ pageService }) => {
      return async function resolveChildAppsFromRouteComponents({ route }: { route?: Route }) {
        const childApps: ChildAppRequestConfig[] = [];

        const components = await Promise.all([
          resolveLazyComponent(pageService.resolveComponentFromConfig('layout', route)),
          resolveLazyComponent(pageService.resolveComponentFromConfig('nestedLayout', route)),
          resolveLazyComponent(pageService.resolveComponentFromConfig('page', route)),
        ]);

        components.forEach((component) => {
          if (component?.childApps) {
            childApps.push(...component.childApps);
          }
        });

        return childApps;
      };
    },
    deps: {
      pageService: PAGE_SERVICE_TOKEN,
    },
  }),
  provide({
    provide: LINK_PREFETCH_HANDLER_TOKEN,
    useFactory: (deps) => {
      return function prefetchChildApps(route) {
        return pagePreload(deps, 'prefetch', false, route);
      };
    },
    multi: true,
    deps: {
      preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      preloadSourceList: CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.resolvePageDeps,
    useFactory: (deps) => {
      let isSpaNavigation = false;
      return function preloadChildApps() {
        const promise = pagePreload(deps, 'preload', isSpaNavigation);

        if (!isSpaNavigation) {
          isSpaNavigation = true;
          return promise;
        }
      };
    },
    multi: true,
    deps: {
      preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
      preloadSourceList: CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
    },
  }),
];
