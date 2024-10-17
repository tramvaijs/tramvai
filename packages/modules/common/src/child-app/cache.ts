import type { Provider } from '@tramvai/core';
import { Scope } from '@tramvai/core';
import { provide } from '@tramvai/core';
import {
  CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN,
  CHILD_REQUIRED_CONTRACTS,
} from '@tramvai/tokens-child-app';
import {
  CACHE_METRICS_SERVER_TOKEN,
  CLEAR_CACHE_TOKEN,
  CREATE_CACHE_TOKEN,
} from '@tramvai/tokens-common';
import { CACHE_NAMES_LIST_TOKEN, CACHES_LIST_TOKEN } from '../cache/tokens';

export const actionsProviders: Provider[] = [
  provide({
    provide: CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN,
    multi: true,
    useValue: [CREATE_CACHE_TOKEN, CLEAR_CACHE_TOKEN],
  }),
  provide({
    provide: CACHES_LIST_TOKEN,
    scope: Scope.SINGLETON,
    useValue: [],
  }),
  ...(typeof window !== 'undefined'
    ? []
    : [
        provide({
          provide: CHILD_REQUIRED_CONTRACTS,
          // borrowed cache factory provided will use the same cache names and metrics
          useValue: [CACHE_NAMES_LIST_TOKEN, CACHE_METRICS_SERVER_TOKEN],
        }),
      ]),
];
