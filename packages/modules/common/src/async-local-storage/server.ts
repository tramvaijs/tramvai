import { AsyncLocalStorage } from 'async_hooks';
import type { ExtractDependencyType } from '@tramvai/core';
import { Module, provide, Scope } from '@tramvai/core';
import {
  WEB_FASTIFY_APP_TOKEN,
  WEB_FASTIFY_APP_BEFORE_INIT_TOKEN,
  WEB_FASTIFY_APP_INIT_TOKEN,
} from '@tramvai/tokens-server-private';
import type { AsyncLocalStorageState } from '@tramvai/tokens-common';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';

function runInAsyncContext({
  app,
  storage,
}: {
  app: ExtractDependencyType<typeof WEB_FASTIFY_APP_TOKEN>;
  storage: ExtractDependencyType<typeof ASYNC_LOCAL_STORAGE_TOKEN>;
}) {
  app.addHook('onRequest', (req, reply, done) => {
    storage.run({}, done);

    // prevent memory leaks, because async context can be destroyed after response,
    // all stored resources will be accumulated in memory, and peak memory allocation will be high
    // `onResponse` is not enough because is not fired when request was aborted by user (https://fastify.dev/docs/latest/Guides/Detecting-When-Clients-Abort/)
    // TODO: can lead to errors because store will be cleared before reply, but maybe it's ok because response will be ignored?
    reply.raw.once('close', () => {
      const store = storage.getStore();

      if (store) {
        for (const key in store) {
          delete store[key as keyof typeof store];
        }
      }
    });
  });

  // we still need to clear store on response, because socket "close" event can not be executed for a long time,
  // because we use `http.Agent` with `keepAlive` enabled, and socket can be reused.
  app.addHook('onResponse', async () => {
    const store = storage.getStore();

    if (store) {
      for (const key in store) {
        delete store[key as keyof typeof store];
      }
    }
  });
}

@Module({
  imports: [],
  providers: [
    provide({
      provide: ASYNC_LOCAL_STORAGE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: () => new AsyncLocalStorage<AsyncLocalStorageState>(),
    }),
    provide({
      provide: WEB_FASTIFY_APP_BEFORE_INIT_TOKEN,
      multi: true,
      scope: Scope.SINGLETON,
      useFactory: (deps) => {
        return () => {
          runInAsyncContext(deps);
        };
      },
      deps: {
        app: WEB_FASTIFY_APP_TOKEN,
        storage: ASYNC_LOCAL_STORAGE_TOKEN,
      },
    }),
    provide({
      provide: WEB_FASTIFY_APP_INIT_TOKEN,
      multi: true,
      scope: Scope.SINGLETON,
      useFactory: (deps) => {
        return () => {
          runInAsyncContext(deps);
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
