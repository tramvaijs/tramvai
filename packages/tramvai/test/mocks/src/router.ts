import type {
  Route,
  NavigationRoute,
  Navigation,
  HistoryState,
  NavigateOptions,
  UpdateCurrentRouteOptions,
} from '@tinkoff/router';
import { AbstractRouter, History } from '@tinkoff/router';
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

class MockHistory extends History {
  private historyStack: Navigation[] = [];
  private currentIndex = -1;
  private keyCounter = 0;

  getNextKey(): number {
    return ++this.keyCounter;
  }

  save(navigation: Navigation): void {
    if (!navigation.replace && this.currentIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
    }

    if (navigation.replace && this.currentIndex >= 0) {
      this.historyStack[this.currentIndex] = navigation;
    } else {
      this.historyStack.push(navigation);
      this.currentIndex = this.historyStack.length - 1;
    }
  }

  async go(to: number): Promise<void> {
    const targetIndex = this.currentIndex + to;

    if (targetIndex < 0 || targetIndex >= this.historyStack.length) {
      return;
    }

    this.currentIndex = targetIndex;
    await this.notifyListener(this.historyStack[targetIndex], to);
  }

  private async notifyListener(navigation: Navigation, to: number = 0) {
    if (this.listener && navigation.url) {
      await this.listener({
        url: navigation.url.path,
        type: navigation.type,
        navigateState: navigation.navigateState,
        replace: navigation.replace,
        history: true,
        isBack: to < 0,
        hasUAVisualTransition: navigation.hasUAVisualTransition,
        viewTransition: navigation.viewTransition,
        viewTransitionTypes: navigation.viewTransitionTypes,
      });
    }
  }

  getCurrentState(): HistoryState | undefined {
    if (this.currentIndex < 0 || this.currentIndex >= this.historyStack.length) {
      return undefined;
    }

    const navigation = this.historyStack[this.currentIndex];
    return {
      key: String(navigation.key ?? this.currentIndex),
      type: navigation.type,
      navigateState: navigation.navigateState,
      index: this.currentIndex,
      viewTransition: navigation.viewTransition,
      viewTransitionTypes: navigation.viewTransitionTypes,
    };
  }

  getNavigation(index: number): Navigation | undefined {
    return this.historyStack[index];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

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
  let redirectTarget: Navigation | null = null;

  const router = new (class extends AbstractRouter {
    onRedirect = async (navigation: Navigation) => {
      redirectTarget = navigation;
    };

    async navigate(navigateOptions: NavigateOptions | string) {
      const options =
        typeof navigateOptions === 'string' ? { url: navigateOptions } : navigateOptions;
      return super.navigate(options);
    }

    async updateCurrentRoute(updateRouteOptions: UpdateCurrentRouteOptions) {
      return super.updateCurrentRoute(updateRouteOptions);
    }

    getCurrentRoute() {
      const history = this.history as MockHistory;
      const state = history.getCurrentState();
      if (state && state.index >= 0) {
        const navigation = history.getNavigation(state.index);
        if (navigation?.url) {
          return {
            ...route,
            path: navigation.url.path,
            actualPath: navigation.url.path,
          };
        }
      }
      return route;
    }

    getCurrentUrl() {
      const history = this.history as MockHistory;
      const state = history.getCurrentState();
      if (state && state.index >= 0) {
        const navigation = history.getNavigation(state.index);
        if (navigation?.url) {
          return navigation.url;
        }
      }
      return url;
    }

    getLastRoute() {
      return route;
    }

    getLastUrl() {
      return url;
    }

    resolveRoute({ url }: { url?: Url } = {}) {
      if (url) {
        return {
          ...route,
          path: url.path,
          actualPath: url.path,
        };
      }
      return route;
    }

    commitNavigation(navigation: Navigation) {
      const finalNavigation = redirectTarget ?? navigation;
      redirectTarget = null;

      if (!finalNavigation.history) {
        this.history.save(finalNavigation);
      }

      if (finalNavigation.url) {
        route = {
          name: 'changed-after-navigate',
          path: finalNavigation.url.path,
          actualPath: finalNavigation.url.path,
          params: {},
        };
        url = finalNavigation.url;
      }
    }

    setupHistoryListener(history: MockHistory) {
      history.listen(async ({ url: historyUrl, navigateState, replace, isBack }) => {
        const currentUrl = this.getCurrentUrl();
        const { pathname, query, hash } = this.resolveUrl({ url: historyUrl });
        const resolvedUrl = this.resolveUrl({ url: historyUrl, query, hash });
        const isSameUrlNavigation = currentUrl?.path === resolvedUrl.path;

        if (isSameUrlNavigation) {
          const navigation: Navigation = {
            type: 'updateCurrentRoute',
            url: resolvedUrl,
            navigateState,
            replace,
            isBack,
            history: true,
            key: (this.history as MockHistory).getNextKey(),
          };
          this.commitNavigation(navigation);
        } else {
          await this.internalNavigate(
            {
              url: historyUrl,
              replace,
              navigateState,
              isBack,
            },
            { history: true }
          );
        }
      });
    }
  })({});

  const history = new MockHistory();

  history.save({
    url: currentUrl,
    type: 'navigate',
    key: 0,
  });

  router.setupHistoryListener(history);
  (router as any).history = history;

  return router;
};
