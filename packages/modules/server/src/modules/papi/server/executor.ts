import { DI_TOKEN, provide, Scope } from '@tinkoff/dippy';
import type { PapiHandlerContext, PapiHandlerOptions } from '@tramvai/papi';
import { getPapiParameters } from '@tramvai/papi';
import {
  ASYNC_LOCAL_STORAGE_TOKEN,
  LOGGER_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { FASTIFY_REQUEST, PAPI_EXECUTOR } from '@tramvai/tokens-server-private';

export const papiExecutorProvider = provide({
  provide: PAPI_EXECUTOR,
  scope: Scope.REQUEST,
  useFactory: ({
    di,
    logger,
    fastifyRequest,
    requestManager,
    responseManager,
    asyncLocalStorage,
  }) => {
    const papiLog = logger('papi');

    const papiOptions: PapiHandlerOptions = {
      requestManager,
      responseManager,
      params: (fastifyRequest.params as Record<string, string>) ?? {},
      cookies: requestManager.getCookies(),
      headers: requestManager.getHeaders(),
      body: requestManager.getBody(),
      parsedUrl: requestManager.getParsedUrl(),
    };

    return (papi) => {
      const { handler, deps, method, path } = getPapiParameters(papi);

      const papiContext: PapiHandlerContext<any> = {
        deps: di.getOfDeps(deps),
        log: papiLog.child(`${method}_${path}`),
      };

      const storage = asyncLocalStorage.getStore();

      if (storage) {
        // save Request DI container to async local storage context for current request
        // eslint-disable-next-line no-param-reassign
        storage.tramvaiRequestDi = di;
      }

      return handler.call(papiContext, papiOptions);
    };
  },
  deps: {
    di: DI_TOKEN,
    logger: LOGGER_TOKEN,
    fastifyRequest: FASTIFY_REQUEST,
    requestManager: REQUEST_MANAGER_TOKEN,
    responseManager: RESPONSE_MANAGER_TOKEN,
    asyncLocalStorage: ASYNC_LOCAL_STORAGE_TOKEN,
  },
});
