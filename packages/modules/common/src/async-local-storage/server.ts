import { AsyncLocalStorage } from 'async_hooks';
import { Module, provide, Scope } from '@tramvai/core';
import { WEB_FASTIFY_APP_TOKEN, WEB_FASTIFY_APP_INIT_TOKEN } from '@tramvai/tokens-server-private';
import type { AsyncLocalStorageState } from '@tramvai/tokens-common';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';

@Module({
  imports: [],
  providers: [
    provide({
      provide: ASYNC_LOCAL_STORAGE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: () => new AsyncLocalStorage<AsyncLocalStorageState>(),
    }),
    provide({
      provide: WEB_FASTIFY_APP_INIT_TOKEN,
      multi: true,
      scope: Scope.SINGLETON,
      useFactory: ({ app, storage }) => {
        return () => {
          app.addHook('onRequest', (req, reply, done) => {
            storage.run({}, done);
          });
        };
      },
      deps: {
        app: WEB_FASTIFY_APP_TOKEN,
        storage: ASYNC_LOCAL_STORAGE_TOKEN,
      },
    }),
  ],
})
export class AsyncLocalStorageModule {}
