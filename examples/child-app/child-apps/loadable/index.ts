import { createChildApp } from '@tramvai/child-app-core';
import { declareAction, provide } from '@tramvai/core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { CHILD_APP_PAGE_COMPONENTS_TOKEN } from '@tramvai/tokens-child-app';
import { lazy } from '@tramvai/react';
import { RouterChildAppModule } from '@tramvai/module-router';
import { COMBINE_REDUCERS } from '@tramvai/tokens-common';
import { LoadableCmp } from './component';
import { CHILD_APP_BASE_TOKEN } from './tokens';
import { testStore } from './stores';

const action = declareAction({
  name: 'action-global',
  fn() {
    this.dispatch(
      testStore.events.logAction(typeof window === 'undefined' ? 'global-server' : 'global-client')
    );
  },
  conditions: {
    dynamic: true,
  },
});

const Lazy = lazy(() => import('./lazy-cmp'));
const LazyUnused = lazy(() => import('./lazy-cmp-unused'));

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'base',
  render: LoadableCmp,
  modules: [CommonChildAppModule, RouterChildAppModule],
  actions: [action],
  providers: [
    provide({
      provide: CHILD_APP_BASE_TOKEN,
      useValue: "I'm little child app",
    }),
    provide({
      provide: CHILD_APP_PAGE_COMPONENTS_TOKEN,
      useValue: {
        FooCmp: Lazy,
        BarCmp: LazyUnused,
      },
    }),
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [testStore],
    }),
  ],
});
