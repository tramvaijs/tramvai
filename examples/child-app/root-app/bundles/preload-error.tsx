import type { PageComponent } from '@tramvai/react';
import { createBundle, declareAction } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';
import { useActions, useStore } from '@tramvai/state';
import { useUrl } from '@tramvai/module-router';
import { ChildApp } from '@tramvai/module-child-app';
import {
  preloadedChildAppInfoStore,
  setFailedToPreloadChildApp,
  setPreloadedChildApp,
} from '../stores/preload';

const childAppPrefetchAction = declareAction({
  name: 'childAppPrefetch',
  fn() {
    const prefetchChildApp = 'client-hints';
    this.deps.preloadManager
      .prefetch({ name: prefetchChildApp })
      .then(() => {
        this.dispatch(setPreloadedChildApp(prefetchChildApp));
      })
      .catch(() => {
        this.dispatch(setFailedToPreloadChildApp(prefetchChildApp));
      });
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
  },
});

const childAppPreloadAction = declareAction({
  name: 'childAppPreload',
  fn() {
    const preloadedChildApp = 'base';
    this.deps.preloadManager
      .preload({ name: preloadedChildApp })
      .then(() => {
        this.dispatch(setPreloadedChildApp(preloadedChildApp));
      })
      .catch(() => {
        this.dispatch(setFailedToPreloadChildApp(preloadedChildApp));
      });
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
  },
});

const Cmp: PageComponent = () => {
  const childAppPreload = useActions(childAppPreloadAction);
  const childAppPrefetch = useActions(childAppPrefetchAction);
  const preloadedChildAppInfo = useStore(preloadedChildAppInfoStore);
  const url = useUrl();

  return (
    <div>
      <button type="button" onClick={childAppPrefetch}>
        Prefetch child-app: client-hints
      </button>
      <button id="preload" type="button" onClick={childAppPreload}>
        Preload child-app: base
      </button>
      <p className="failed">Failed: {preloadedChildAppInfo.failedToLoad.join(',')}</p>
      <p className="preloaded">Preloaded: {preloadedChildAppInfo.preloaded.join(',')}</p>
      {url?.query?.renderChildApp ? <ChildApp name="base" /> : null}
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'preload-error',
  components: {
    pageDefault: Cmp,
  },
});
