import type { Route, NavigationRoute, Navigation } from '@tinkoff/router';
import { AbstractRouter } from '@tinkoff/router';
import type { Url } from '@tinkoff/url';
import { parse } from '@tinkoff/url';

interface Options {
  currentRoute?: Route | NavigationRoute;
  currentUrl?: Url;
}

const isNavigationRoute = (route: Options['currentRoute']): route is NavigationRoute => {
  return (
    (route as NavigationRoute).actualPath !== undefined &&
    (route as NavigationRoute).params !== undefined
  );
};

export const createMockRouter = ({
  currentRoute = { name: 'root', path: '/' },
  currentUrl = parse(currentRoute.path),
}: Options = {}): AbstractRouter => {
  let route: NavigationRoute = isNavigationRoute(currentRoute)
    ? currentRoute
    : {
        params: {},
        actualPath: currentRoute.path,
        ...currentRoute,
      };
  let url = currentUrl;
  let blocked = false;

  return new (class extends AbstractRouter {
    onRedirect = async (navigation: Navigation) => {
      this.commitNavigation(navigation);

      blocked = true;
    };

    getCurrentRoute() {
      return route;
    }

    getCurrentUrl() {
      return url;
    }

    getLastRoute() {
      return route;
    }

    getLastUrl() {
      return url;
    }

    resolveRoute() {
      return route;
    }

    commitNavigation(navigation: Navigation) {
      if (blocked) {
        blocked = false;
        return;
      }

      route = {
        ...route,
        name: 'changed-after-navigate',
        path: navigation.url?.path ?? route.path,
      };
      url = navigation.url ?? url;
    }
  })({});
};
