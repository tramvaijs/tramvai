import { Route } from '@tinkoff/router';
import { parse } from '@tinkoff/url';
import { optional, provide } from '@tramvai/core';
import {
  LINK_PREFETCH_HANDLER_TOKEN,
  LINK_PREFETCH_MANAGER_TOKEN,
  PAGE_REGISTRY_TOKEN,
  ROUTER_TOKEN,
  ROUTE_RESOLVE_TOKEN,
} from '@tramvai/tokens-router';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { routeTransformToken } from '../../tokens';

export const prefetchProviders = [
  provide({
    provide: LINK_PREFETCH_MANAGER_TOKEN,
    useFactory: ({
      router,
      routeTransform,
      routeResolve,
      logger,
      pageRegistry,
      prefetchHandlers,
    }) => {
      const log = logger('link-prefetch-manager');

      const prefetch = async (url: string) => {
        log.info({ event: 'prefetch-route-init', url });

        // first, try to find static or resolved dynamic route
        let route: Route | void = router.resolve(url);

        // if route not found, try to resolve dynamic route,
        // logic from `ROUTER_TOKEN` provider factory, without `router.addRoute` method call
        if (!route && routeResolve) {
          const parsedUrl = parse(url);

          route = await routeResolve({
            url: parsedUrl,
            type: 'navigate',
          });

          if (route) {
            route = routeTransform(route);
            // warmup route for possible navigation
            router.addRoute(route);
          }
        }

        if (!route) {
          log.info({ event: 'prefetch-route-not-found', url });
          return;
        }

        try {
          await pageRegistry.resolve(route);

          await Promise.all(prefetchHandlers.map((handler) => handler(route as Route)));

          log.info({ event: 'prefetch-route-success', url });
        } catch (error) {
          log.warn({
            event: 'prefetch-fail',
            url,
            error,
          });
        }
      };

      return {
        prefetch: (url: string) => {
          return prefetch(url);
        },
      };
    },
    deps: {
      router: ROUTER_TOKEN,
      routeTransform: routeTransformToken,
      routeResolve: optional(ROUTE_RESOLVE_TOKEN),
      logger: LOGGER_TOKEN,
      pageRegistry: PAGE_REGISTRY_TOKEN,
      prefetchHandlers: optional(LINK_PREFETCH_HANDLER_TOKEN),
    },
  }),
];
