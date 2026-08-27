import { provide, optional } from '@tramvai/core';
import type { Deferred, DeferredActionsMap } from '@tramvai/tokens-common';
import {
  DEFERRED_ACTIONS_MAP_TOKEN,
  DEFERRED_ACTIONS_ROOT_MAP_TOKEN,
} from '@tramvai/tokens-common';
import { CHILD_APP_INTERNAL_CONFIG_TOKEN } from '@tramvai/tokens-child-app';
import { createDeferredMap, getPrefix } from './deferredMap';

declare global {
  interface Window {
    __TRAMVAI_DEFERRED_ACTIONS: Record<string, Deferred>;
  }
}

export const providers = [
  provide({
    provide: DEFERRED_ACTIONS_ROOT_MAP_TOKEN,
    useFactory: (): DeferredActionsMap => {
      if (!window.__TRAMVAI_DEFERRED_ACTIONS) {
        window.__TRAMVAI_DEFERRED_ACTIONS = {};
      }

      return {
        get: (key) => window.__TRAMVAI_DEFERRED_ACTIONS[key],
        set: (key, value) => {
          window.__TRAMVAI_DEFERRED_ACTIONS[key] = value;
        },
        has: (key) => key in window.__TRAMVAI_DEFERRED_ACTIONS,
        forEach: (callback) => {
          Object.keys(window.__TRAMVAI_DEFERRED_ACTIONS).forEach((key) => {
            callback(window.__TRAMVAI_DEFERRED_ACTIONS[key], key);
          });
        },
      };
    },
  }),
  provide({
    provide: DEFERRED_ACTIONS_MAP_TOKEN,
    useFactory: ({ store, childAppConfig }) => createDeferredMap(store, getPrefix(childAppConfig)),
    deps: {
      store: DEFERRED_ACTIONS_ROOT_MAP_TOKEN,
      childAppConfig: optional(CHILD_APP_INTERNAL_CONFIG_TOKEN),
    },
  }),
];
