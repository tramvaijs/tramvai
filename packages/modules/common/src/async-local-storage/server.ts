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

          // prevent memory leaks, because async context can be destroyed after response,
          // all stored resources will be accumulated in memory, and peak memory allocation will be high
          app.addHook('onResponse', () => {
            const store = storage.getStore();

            if (store) {
              for (const key in store) {
                delete store[key as keyof typeof store];
              }
            }
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
