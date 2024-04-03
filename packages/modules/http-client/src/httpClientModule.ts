import type { MakeRequest } from '@tinkoff/request-core';
import { createToken } from '@tinkoff/dippy';
import { Module, APP_INFO_TOKEN, Scope, provide } from '@tramvai/core';
import {
  HTTP_CLIENT_FACTORY,
  HTTP_CLIENT,
  API_CLIENT_PASS_HEADERS,
  HTTP_CLIENT_AGENT,
  DISABLE_CIRCUIT_BREAKER,
  DEFAULT_HTTP_CLIENT_FACTORY_OPTIONS,
  DEFAULT_HTTP_CLIENT_INTERCEPTORS,
} from '@tramvai/tokens-http-client';
import {
  LOGGER_TOKEN,
  CREATE_CACHE_TOKEN,
  ENV_MANAGER_TOKEN,
  ENV_USED_TOKEN,
  REQUEST_MANAGER_TOKEN,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
} from '@tramvai/tokens-common';
import { httpClientFactory } from './httpClient/httpClientFactory';
import { PapiClientModule } from './papiClientModule';

const createCacheToken = createToken<typeof CREATE_CACHE_TOKEN>('httpClient createCache');

export const HttpClientModule = /* @__PURE__ */ Module({
  imports: [PapiClientModule],
  providers: [
    provide({
      provide: HTTP_CLIENT_FACTORY,
      useFactory: httpClientFactory,
      deps: {
        logger: LOGGER_TOKEN,
        envManager: ENV_MANAGER_TOKEN,
        appInfo: APP_INFO_TOKEN,
        createCache: createCacheToken,
        makeRequestRegistry: 'makeRequestRegistry',
        requestManager: {
          token: REQUEST_MANAGER_TOKEN,
          optional: true,
        },
        headersList: {
          token: API_CLIENT_PASS_HEADERS,
          optional: true,
        },
        agent: {
          token: HTTP_CLIENT_AGENT,
          optional: true,
        },
        disableCircuitBreaker: {
          token: DISABLE_CIRCUIT_BREAKER,
          optional: true,
        },
        defaultOptions: {
          token: DEFAULT_HTTP_CLIENT_FACTORY_OPTIONS,
          optional: true,
        },
        defaultInterceptors: {
          token: DEFAULT_HTTP_CLIENT_INTERCEPTORS,
          optional: true,
        },
        commandLineExecutionContext: {
          token: COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: HTTP_CLIENT,
      useFactory: ({ factory }) => {
        return factory({
          name: 'http-client',
          enableCircuitBreaker: false,
        });
      },
      deps: {
        factory: HTTP_CLIENT_FACTORY,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      useValue: [
        { key: 'HTTP_CLIENT_CACHE_DISABLED', optional: true, dehydrate: false },
        { key: 'HTTP_CLIENT_CIRCUIT_BREAKER_DISABLED', optional: true, dehydrate: false },
      ],
    }),
    /**
     * хранилище для экземпляров @tinkoff/request
     *
     * требуется хранить экземпляры в единственном виде,
     * т.к. многие плагины @tinkoff/request после инициализации имеют состояние
     * (cache, circuit breaker), и не будут корректно работать на сервере,
     * если создавать новые экземпляры на Scope.REQUEST
     */
    provide({
      provide: 'makeRequestRegistry',
      scope: Scope.SINGLETON,
      useFactory: () => new Map<string, MakeRequest>(),
    }),
    /**
     * `CREATE_CACHE_TOKEN` имеет проверку, если токен используется провайдером,
     * который имеет Scope.SINGLETON, то инстанс кэша сохраняется в общее хранилище,
     * и доступен для очистки через `/papi/clear-cache`.
     * Scope.REQUEST игнорируется, т.к. это верная утечка памяти,
     * инстансов кэши было бы неограниченное количество.
     *
     * HTTP клиенты создаются со Scope.REQUEST, но инстансы @tinkoff/request
     * (и соответственно кэшей) создаются только один раз, благодаря `makeRequestRegistry`.
     * это гарантирует отсутствие утечек памяти, поэтому мы обходим проверку
     * на Scope.SINGLETON c помощью обертки `createCacheToken`
     */
    provide({
      provide: createCacheToken,
      scope: Scope.SINGLETON,
      useFactory: ({ createCache }) => {
        return createCache;
      },
      deps: {
        createCache: CREATE_CACHE_TOKEN,
      },
    }),
    provide({
      provide: API_CLIENT_PASS_HEADERS,
      useValue: ['x-request-id'],
    }),
  ],
})(class HttpClientModule {});
