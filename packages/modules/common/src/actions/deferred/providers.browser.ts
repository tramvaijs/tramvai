import { provide } from '@tramvai/core';
import type { Deferred } from '@tramvai/tokens-common';
import { DEFERRED_ACTIONS_MAP_TOKEN } from '@tramvai/tokens-common';
import { __Deferred } from './deferred.inline';

declare global {
  interface Window {
    __TRAMVAI_DEFERRED_ACTIONS: Record<string, Deferred>;
  }
}

export const providers = [
  provide({
    provide: DEFERRED_ACTIONS_MAP_TOKEN,
    useFactory: () => {
      return {
        get(key: string) {
          return window.__TRAMVAI_DEFERRED_ACTIONS[key];
        },
        set(key: string, value: any) {
          window.__TRAMVAI_DEFERRED_ACTIONS[key] = value;
        },
        has(key: string) {
          return key in window.__TRAMVAI_DEFERRED_ACTIONS;
        },
        forEach(callback: (value: any, key: string) => void) {
          Object.keys(window.__TRAMVAI_DEFERRED_ACTIONS).forEach((key) => {
            callback(window.__TRAMVAI_DEFERRED_ACTIONS[key], key);
          });
        },
      };
    },
  }),
];
