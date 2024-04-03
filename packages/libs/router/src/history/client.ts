import type { Url } from '@tinkoff/url';
import { History } from './base';
import type { Navigation, NavigationType, HistoryOptions, Route } from '../types';
import type { Wrapper } from './wrapper';
import { wrapHistory } from './wrapper';

interface HistoryState {
  key: string;
  type: NavigationType;
  navigateState?: any;
  index: number;
}

const isHistoryState = (state: any): state is HistoryState => {
  return state && typeof state.key === 'string';
};

const generateKey = (navigation: Navigation) => {
  const { to } = navigation;

  if (to) {
    return `${to.name}_${to.path}`;
  }
};

interface PreviousNavigateState {
  previousRoute?: Route;
  previousUrl?: Url;
}

const generatePreviousNavigateState = (navigation: Navigation): PreviousNavigateState => {
  const state: PreviousNavigateState = {};

  if (navigation.from) {
    state.previousRoute = navigation.from;
  }

  if (navigation.fromUrl) {
    state.previousUrl = navigation.fromUrl;
  }

  return state;
};

const generateState = (
  navigation: Navigation,
  currentState?: HistoryState,
  index: number = 0
): HistoryState => {
  const key = generateKey(navigation);
  const previousNavigateState = generatePreviousNavigateState(navigation);
  let { type } = navigation;

  if (navigation.replace && currentState) {
    type = currentState.type === type ? type : 'navigate';
  }

  const navigateState = {
    ...previousNavigateState,
    ...navigation.navigateState,
  };

  return {
    key,
    type,
    navigateState,
    index,
  };
};

export class ClientHistory extends History {
  private goPromiseResolve: () => void;
  private goPromiseReject: (err: Error) => void;
  private currentIndex = 0;
  private currentState: HistoryState;

  protected historyWrapper: Wrapper<HistoryState>;

  constructor() {
    super();
    this.historyWrapper = wrapHistory({
      onNavigate: ({ url, replace, navigateState }) => {
        this.listener({
          url,
          replace,
          navigateState,
        });
      },
    });
  }

  protected onNavigate: Parameters<typeof wrapHistory>[0]['onNavigate'];

  init(navigation: Navigation) {
    this.currentState = isHistoryState(window.history?.state)
      ? window.history.state
      : generateState(navigation);
    this.currentIndex = this.currentState.index;
    this.historyWrapper.init(this.currentState);
    this.historyWrapper.subscribe(async ({ path, state }) => {
      try {
        let navigationType: NavigationType;
        let navigateState;

        if (isHistoryState(state)) {
          const { key: prevKey, type: prevType } = this.currentState;
          const { key, type } = state;

          this.currentState = state;
          navigateState = state.navigateState;

          if (
            key === prevKey &&
            (type === 'updateCurrentRoute' || prevType === 'updateCurrentRoute')
          ) {
            navigationType = 'updateCurrentRoute';
          } else {
            navigationType = 'navigate';
          }
        } else {
          // if it is not HistoryState than it is probably not a state from @tinkoff/router so reset it
          this.currentIndex = 0;
        }

        await this.listener({
          type: navigationType,
          history: true,
          url: path,
          navigateState,
        });

        this.goPromiseResolve?.();
      } catch (err) {
        this.goPromiseReject?.(err);
      }
    });
  }

  save(navigation: Navigation): void {
    const { replace, url } = navigation;

    if (!replace) {
      this.currentIndex++;
    }

    this.currentState = generateState(navigation, this.currentState, this.currentIndex);

    this.historyWrapper.navigate({
      path: url.path,
      replace,
      state: this.currentState,
    });
  }

  go(to: number, options?: HistoryOptions) {
    if (this.currentIndex < 1) {
      if (options?.historyFallback) {
        return this.listener({
          url: options.historyFallback,
          type: 'navigate',
          history: false,
          replace: options.replace,
        });
      }

      const historyFallbackRoute = this.tree?.getHistoryFallback(window.location.pathname);

      if (historyFallbackRoute) {
        return this.listener({
          url: historyFallbackRoute.actualPath,
          type: 'navigate',
          history: false,
        });
      }
    }

    this.currentIndex += to;

    const promise = new Promise<void>((resolve, reject) => {
      this.goPromiseResolve = resolve;
      this.goPromiseReject = reject;
    });

    this.historyWrapper.history(to);

    return promise;
  }
}
