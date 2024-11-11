import { createChildApp } from '@tramvai/child-app-core';
import { createAction, provide } from '@tramvai/core';
import { CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN } from '@tramvai/tokens-child-app';
import type { ActionCondition } from '@tramvai/module-common';
import {
  COMBINE_REDUCERS,
  CommonChildAppModule,
  ACTION_CONDITIONALS,
  CONTEXT_TOKEN,
} from '@tramvai/module-common';
import { StateCmp } from './component';
import { testStore } from './stores';
import { updateRootValueAction } from './actions';

declare global {
  interface Window {
    TRAMVAI_TEST_CHILD_APP_CUSTOM_CONDITION: number;
    TRAMVAI_TEST_CHILD_APP_MIXED_CONDITION: number;
  }
}

if (typeof window !== 'undefined') {
  window.TRAMVAI_TEST_CHILD_APP_CUSTOM_CONDITION = 0;
  window.TRAMVAI_TEST_CHILD_APP_MIXED_CONDITION = 0;
}

const actionWithCustomCondition = createAction({
  name: 'actionWithCustomCondition',
  fn() {
    window.TRAMVAI_TEST_CHILD_APP_CUSTOM_CONDITION++;
  },
  conditions: {
    custom: true,
    onlyBrowser: true,
  },
});

const actionWithMixedCondition = createAction({
  name: 'actionWithCustomCondition',
  fn() {
    window.TRAMVAI_TEST_CHILD_APP_MIXED_CONDITION++;
  },
  conditions: {
    custom: true,
    factory: true,
    onlyBrowser: true,
  },
});

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'state',
  render: StateCmp,
  modules: [CommonChildAppModule],
  actions: [updateRootValueAction, actionWithCustomCondition, actionWithMixedCondition],
  providers: [
    {
      provide: COMBINE_REDUCERS,
      multi: true,
      useValue: testStore,
    },
    {
      provide: CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN,
      multi: true,
      useValue: ['root', 'another root'],
    },
    provide({
      provide: ACTION_CONDITIONALS,
      multi: true,
      useValue: {
        key: 'onlyBrowser',
        fn: (checker) => {
          if (checker.conditions.onlyBrowser && typeof window === 'undefined') {
            checker.forbid();
          }
        },
      },
    }),
    provide({
      provide: ACTION_CONDITIONALS,
      multi: true,
      useFactory: ({ context }): ActionCondition => ({
        key: 'custom',
        fn: (checker) => {
          const { custom, factory } = checker.conditions;

          if (custom) {
            const testState = context.getState(testStore);

            if (!testState) {
              return checker.forbid();
            }
            checker.allow();

            // without isolated DI and contracts, host app conditionals will not be merged with this one, and this action will be blocked.
            // with isolation, host app conditionals will be merged with this one, and this action will be allowed,
            // because `false` state will be reset in `factory` condition
            if (factory) {
              // @ts-expect-error
              // eslint-disable-next-line no-param-reassign
              checker.status = false;
            }
          }
        },
      }),
      deps: {
        context: CONTEXT_TOKEN,
      },
    }),
  ],
});
