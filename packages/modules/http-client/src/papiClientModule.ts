import { Module, DI_TOKEN, provide, Scope } from '@tramvai/core';
import { SERVER_MODULE_PAPI_PUBLIC_ROUTE } from '@tramvai/tokens-server';
import { PAPI_SERVICE } from '@tramvai/tokens-http-client';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import { PapiService } from './papi/papiService';

export { PapiService };

export const PapiClientModule = /* @__PURE__ */ Module({
  providers: [
    provide({
      provide: PAPI_SERVICE,
      scope: Scope.SINGLETON,
      useClass: PapiService,
      deps: {
        di: DI_TOKEN,
        papi: { token: SERVER_MODULE_PAPI_PUBLIC_ROUTE, optional: true },
        storage: ASYNC_LOCAL_STORAGE_TOKEN,
      },
    }),
  ],
})(class PapiClientModule {});
