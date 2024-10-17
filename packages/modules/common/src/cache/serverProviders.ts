import type { Provider } from '@tramvai/core';
import { Scope, provide } from '@tramvai/core';
import { SERVER_MODULE_PAPI_PRIVATE_ROUTE } from '@tramvai/tokens-server';
import {
  CACHE_METRICS_SERVER_TOKEN,
  CLEAR_CACHE_TOKEN,
  LOGGER_TOKEN,
} from '@tramvai/tokens-common';
import { HOST_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';
import { papiClearCache } from './papi';
import { CACHE_NAMES_LIST_TOKEN } from './tokens';
import { cacheMetricsServerProviders } from './cacheMetrics';

export const providers: Provider[] = [
  ...cacheMetricsServerProviders,
  provide({
    provide: CACHE_NAMES_LIST_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: () => new Set<string>(),
  }),
  provide({
    provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
    multi: true,
    useFactory: papiClearCache,
    deps: {
      clearCache: CLEAR_CACHE_TOKEN,
      logger: LOGGER_TOKEN,
    },
  }),
  provide({
    provide: HOST_PROVIDED_CONTRACTS,
    useValue: {
      providedContracts: [CACHE_NAMES_LIST_TOKEN, CACHE_METRICS_SERVER_TOKEN],
    },
  }),
];
