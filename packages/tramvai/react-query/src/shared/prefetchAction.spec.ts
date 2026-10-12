import { AsyncLocalStorage } from 'async_hooks';
import { createQuery } from '../query/create';
import { createInfiniteQuery } from '../infiniteQuery/create';

const createDeferredPromise = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

const runAction = (
  action: { fn: Function },
  { streamingEnabled = false, storage }: { streamingEnabled?: boolean; storage?: AsyncLocalStorage<any> } = {}
) => {
  const prefetch = createDeferredPromise();
  const queryClient = {
    prefetchQuery: jest.fn(() => prefetch.promise),
    prefetchInfiniteQuery: jest.fn(() => prefetch.promise),
  };
  const di = { getOfDeps: () => ({}) };
  let settled = false;

  const result = Promise.resolve(
    action.fn.call({
      deps: { queryClient, di, streamingActive: streamingEnabled, storage: storage ?? null },
    })
  ).then(() => {
    settled = true;
  });

  return {
    queryClient,
    resolvePrefetch: prefetch.resolve,
    result,
    isSettled: async () => {
      // flush microtasks
      await new Promise((resolve) => setImmediate(resolve));
      return settled;
    },
  };
};

const query = createQuery({
  key: 'test',
  fn: async () => 'data',
});

const deferredQuery = createQuery({
  key: 'test-deferred',
  fn: async () => 'data',
  deferred: true,
});

describe('prefetchAction', () => {
  it('awaits regular query', async () => {
    const { queryClient, isSettled, resolvePrefetch } = runAction(query.prefetchAction(), {
      streamingEnabled: true,
    });

    expect(queryClient.prefetchQuery).toHaveBeenCalledTimes(1);
    expect(await isSettled()).toBe(false);

    resolvePrefetch();

    expect(await isSettled()).toBe(true);
  });

  it('does not await deferred query with streaming', async () => {
    const { queryClient, isSettled } = runAction(deferredQuery.prefetchAction(), {
      streamingEnabled: true,
    });

    expect(queryClient.prefetchQuery).toHaveBeenCalledTimes(1);
    expect(await isSettled()).toBe(true);
  });

  it('awaits deferred query without streaming', async () => {
    const { isSettled, resolvePrefetch } = runAction(deferredQuery.prefetchAction(), {
      streamingEnabled: false,
    });

    expect(await isSettled()).toBe(false);

    resolvePrefetch();

    expect(await isSettled()).toBe(true);
  });

  it('does not await deferred query at client-side', async () => {
    (global as any).window = {};

    try {
      const { isSettled } = runAction(deferredQuery.prefetchAction(), {
        streamingEnabled: false,
      });

      expect(await isSettled()).toBe(true);
    } finally {
      delete (global as any).window;
    }
  });

  it('overrides query option', async () => {
    const regular = runAction(deferredQuery.prefetchAction(undefined, { deferred: false }), {
      streamingEnabled: true,
    });
    const deferred = runAction(query.prefetchAction(undefined, { deferred: true }), {
      streamingEnabled: true,
    });

    expect(await regular.isSettled()).toBe(false);
    expect(await deferred.isSettled()).toBe(true);
  });

  it('marks deferred execution in async local storage', async () => {
    const storage = new AsyncLocalStorage<any>();
    let isDeferredExecution: boolean | undefined;

    // action is executed inside request async context, as in the real application
    await storage.run({ requestId: 1 }, async () => {
      const action = deferredQuery.prefetchAction();
      const prefetch = jest.fn(() => {
        isDeferredExecution = storage.getStore()?.isDeferredExecution;
        return Promise.resolve();
      });

      await action.fn.call({
        deps: {
          queryClient: { prefetchQuery: prefetch },
          di: { getOfDeps: () => ({}) },
          streamingActive: true,
          storage,
        },
      } as any);
    });

    expect(isDeferredExecution).toBe(true);
  });

  describe('server-side retries', () => {
    const getRetry = (queryClient: { prefetchQuery: jest.Mock }) =>
      (queryClient.prefetchQuery.mock.calls[0] as any[])[0].retry;

    it('are disabled for streamed query', () => {
      const { queryClient } = runAction(deferredQuery.prefetchAction(), { streamingEnabled: true });

      expect(getRetry(queryClient)).toBe(false);
    });

    it('are kept when set explicitly for the query', () => {
      const queryWithRetry = createQuery({
        key: 'test-retry',
        fn: async () => 'data',
        queryOptions: { retry: 2 },
        deferred: true,
      });
      const { queryClient } = runAction(queryWithRetry.prefetchAction(), {
        streamingEnabled: true,
      });

      expect(getRetry(queryClient)).toBe(2);
    });

    it('are not changed for awaited query', () => {
      const regular = runAction(query.prefetchAction(), { streamingEnabled: true });
      const notStreamed = runAction(deferredQuery.prefetchAction(), { streamingEnabled: false });

      expect(getRetry(regular.queryClient)).toBeUndefined();
      expect(getRetry(notStreamed.queryClient)).toBeUndefined();
    });

    it('are not changed at client-side', () => {
      (global as any).window = {};

      try {
        const { queryClient } = runAction(deferredQuery.prefetchAction());

        expect(getRetry(queryClient)).toBeUndefined();
      } finally {
        delete (global as any).window;
      }
    });
  });

  it('supports infinite queries', async () => {
    const deferredInfiniteQuery = createInfiniteQuery({
      key: 'test-infinite',
      fn: async () => 'data',
      deferred: true,
    });

    const { queryClient, isSettled } = runAction(deferredInfiniteQuery.prefetchAction(), {
      streamingEnabled: true,
    });

    expect(queryClient.prefetchInfiniteQuery).toHaveBeenCalledTimes(1);
    expect(await isSettled()).toBe(true);
  });
});
