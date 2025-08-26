import isNil from '@tinkoff/utils/is/nil';
import compose from '@tinkoff/utils/function/compose';
import type { MakeRequest } from '@tinkoff/request-core';
import type {
  HttpClient,
  HttpClientBaseOptions,
  HttpClientInterceptor,
} from '@tramvai/http-client';
import type { TinkoffRequestOptions } from '@tramvai/tinkoff-request-http-client-adapter';
import {
  mergeOptions,
  createTinkoffRequest,
  HttpClientAdapter,
} from '@tramvai/tinkoff-request-http-client-adapter';
import type { APP_INFO_TOKEN } from '@tramvai/core';
import type {
  API_CLIENT_PASS_HEADERS,
  HttpClientFactoryOptions,
  HTTP_CLIENT_AGENT,
  HTTP_CLIENT_FACTORY,
  DISABLE_CIRCUIT_BREAKER,
} from '@tramvai/tokens-http-client';
import type {
  LOGGER_TOKEN,
  CREATE_CACHE_TOKEN,
  Cache,
  ENV_MANAGER_TOKEN,
  REQUEST_MANAGER_TOKEN,
  CacheFactoryOptions,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
} from '@tramvai/tokens-common';
import type { QuerySerializer } from '@tinkoff/request-plugin-protocol-http';
import type { ExtractDependencyType, ExtractTokenType } from '@tinkoff/dippy';
import { fillHeaderIp, fillHeaders } from '../utils';
import { transformUserAgent } from './headers';

const environmentDependentOptions: TinkoffRequestOptions =
  typeof window === 'undefined'
    ? {
        defaultTimeout: 2000,
      }
    : {
        defaultTimeout: 30000,
      };

export const httpClientFactory = ({
  logger,
  envManager,
  appInfo,
  requestManager,
  headersList,
  createCache,
  makeRequestRegistry,
  agent,
  querySerializer,
  disableCircuitBreaker = false,
  defaultOptions,
  defaultInterceptors,
  commandLineExecutionContext,
}: {
  logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
  envManager: ExtractDependencyType<typeof ENV_MANAGER_TOKEN>;
  appInfo: ExtractDependencyType<typeof APP_INFO_TOKEN>;
  requestManager: ExtractDependencyType<typeof REQUEST_MANAGER_TOKEN> | null;
  headersList: ExtractDependencyType<typeof API_CLIENT_PASS_HEADERS> | null;
  createCache: ExtractDependencyType<typeof CREATE_CACHE_TOKEN> | null;
  makeRequestRegistry: Map<string, MakeRequest>;
  agent: ExtractDependencyType<typeof HTTP_CLIENT_AGENT> | null;
  querySerializer?: QuerySerializer;
  disableCircuitBreaker: ExtractDependencyType<typeof DISABLE_CIRCUIT_BREAKER> | null;
  defaultOptions: Partial<HttpClientFactoryOptions> | null;
  defaultInterceptors: HttpClientInterceptor[] | null;
  commandLineExecutionContext: ExtractDependencyType<
    typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN
  > | null;
}): ExtractTokenType<typeof HTTP_CLIENT_FACTORY> => {
  return (options: HttpClientFactoryOptions): HttpClient => {
    if (!options.name) {
      throw Error(`You need to pass a unique field "name" for the HTTP client instance`);
    }

    const forceDisableCache = envManager.get('HTTP_CLIENT_CACHE_DISABLED');
    const forceDisabledCircuitBreaker = envManager.get('HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED');
    const interceptors = { interceptors: defaultInterceptors || [] };

    const adapterOptions = mergeOptions(
      mergeOptions(
        {
          logger,
          agent,
          querySerializer,
          method: 'GET',
          // don't create function here to prevent leak `commandLineExecutionContext` (which refer to Child DI) into the new function closure
          createCache: createCache
            ? createCache.bind<null, ['memory'], [CacheFactoryOptions<'memory'>], Cache>(
                null,
                'memory'
              )
            : undefined,
          modifyRequest: compose(
            fillHeaderIp({ requestManager }),
            fillHeaders({ requestManager, headersList })
          ),
          circuitBreakerOptions: {
            failureThreshold: 75,
            minimumFailureCount: 10,
          },
          // TODO: remove any after [resolving](https://github.com/southpolesteve/node-abort-controller/issues/31)
          signal: commandLineExecutionContext?.()?.abortSignal as any,
          ...environmentDependentOptions,
        },
        defaultOptions ? mergeOptions(defaultOptions, interceptors) : interceptors
      ),
      options
    ) as TinkoffRequestOptions & { name: string };

    adapterOptions.headers = {
      ...transformUserAgent({ appInfo, envManager }),
      ...adapterOptions.headers,
    };

    if (!isNil(forceDisableCache)) {
      adapterOptions.disableCache = !!forceDisableCache;
    }

    if (disableCircuitBreaker) {
      adapterOptions.enableCircuitBreaker = false;
    }

    // environment variable in priority over disableCircuitBreaker
    if (forceDisabledCircuitBreaker === 'true') {
      adapterOptions.enableCircuitBreaker = !forceDisabledCircuitBreaker;
    }

    // cache @tinkoff/request instance for performance reason
    if (!makeRequestRegistry.has(adapterOptions.name)) {
      const tRequestOptions = { ...adapterOptions };
      // prevent memory leak, because COMMAND_LINE_EXECUTION_CONTEXT_TOKEN has Request scope and linked to ChildContainer
      delete tRequestOptions.signal;

      makeRequestRegistry.set(adapterOptions.name, createTinkoffRequest(tRequestOptions));
    }

    const makeRequest = makeRequestRegistry.get(adapterOptions.name)!;

    const httpClientAdapter = new HttpClientAdapter({
      options: adapterOptions as HttpClientBaseOptions,
      makeRequest,
    });

    return httpClientAdapter;
  };
};
