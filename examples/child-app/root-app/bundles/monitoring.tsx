import type { PageComponent } from '@tramvai/react';
import { useUrl } from '@tramvai/module-router';
import { createBundle, declareAction } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN, ChildApp } from '@tramvai/module-child-app';
import { useActions, useStore } from '@tramvai/state';
import { tapableHooksEventsStore } from '../stores/tapableHooks';

const prefetchChildAppAction = declareAction({
  name: 'prefetchChildAppAction',
  fn() {
    this.deps.preloadManager.prefetch({ name: 'error' });
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
  },
});

const Fallback = () => <div>We Are Fallback</div>;

const Cmp: PageComponent = () => {
  const { events } = useStore(tapableHooksEventsStore);
  const prefetchChildApp = useActions(prefetchChildAppAction);

  const { query } = useUrl();

  const childApp = query.childApp === 'error' ? 'error' : 'base';

  return (
    <>
      <div id="events">{events.join(',')}</div>
      <div>Content from root</div>
      <button type="button" onClick={prefetchChildApp}>
        Manually prefetch child-app
      </button>
      <ChildApp fallback={Fallback} name={childApp} />
    </>
  );
};

Cmp.childApps = [{ name: 'base' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'monitoring',
  components: {
    pageDefault: Cmp,
  },
});
