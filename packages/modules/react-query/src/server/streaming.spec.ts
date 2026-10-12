import { hydrate, QueryClient, QueryObserver } from '@tanstack/react-query';
import type { StreamingTransport, StreamingTransportRegistry } from '@tramvai/tokens-render';
import { hydrateStreamedQueries, subscribeToLateQueries } from '../shared/streaming';
import { dehydrateWithStreaming } from './streaming';

const PROP_KEY = '__REACT_QUERY_STATE__test';

const flush = () => new Promise((resolve) => setImmediate(resolve));

/**
 * In-memory streaming transport: data goes through JSON as in the real one,
 * and is delivered to the client registry only when the test executes streamed "scripts"
 */
const createFakeStreaming = () => {
  const values = new Map<string, { promise: Promise<unknown>; resolve: Function; reject: Function }>();
  const channels = new Map<string, { queue: unknown[]; listener?: (payload: any) => void }>();
  const scripts: Array<{ type: string; run: () => void }> = [];
  const waits: Promise<unknown>[] = [];
  const finishCallbacks: Array<() => void> = [];

  const getValue = (key: string) => {
    if (!values.has(key)) {
      const value: any = {};

      value.promise = new Promise((resolve, reject) => {
        value.resolve = resolve;
        value.reject = reject;
      });
      value.promise.catch(() => {});
      values.set(key, value);
    }

    return values.get(key)!;
  };
  const getChannel = (channel: string) => {
    if (!channels.has(channel)) {
      channels.set(channel, { queue: [] });
    }

    return channels.get(channel)!;
  };
  const serialize = (data: unknown) => JSON.parse(JSON.stringify(data));

  const transport: StreamingTransport = {
    stream: (key, promise) =>
      waits.push(
        promise.then(
          (data) =>
            scripts.push({ type: 'resolve', run: () => getValue(key).resolve(serialize(data)) }),
          () => scripts.push({ type: 'reject', run: () => getValue(key).reject(new Error('rejected')) })
        )
      ),
    emit: (channel, payload) =>
      scripts.push({
        type: 'emit',
        run: () => {
          const target = getChannel(channel);

          if (target.listener) {
            target.listener(serialize(payload));
          } else {
            target.queue.push(serialize(payload));
          }
        },
      }),
    onFinish: (callback) => finishCallbacks.push(callback),
  };

  const registry: StreamingTransportRegistry = {
    get: (key) => getValue(key).promise,
    subscribe: (channel, listener) => {
      const target = getChannel(channel);
      const queued = target.queue;

      target.queue = [];
      target.listener = listener;
      queued.forEach(listener);
    },
  };

  return {
    transport,
    registry,
    scripts,
    executeScripts: () => scripts.splice(0).forEach((script) => script.run()),
    // the same as response tasks processing
    settle: () => Promise.all(waits.splice(0)),
    finish: () => finishCallbacks.forEach((callback) => callback()),
  };
};

const createControlledQuery = (queryClient: QueryClient, key: string) => {
  let resolve: (data: unknown) => void = () => {};
  let reject: (error: Error) => void = () => {};

  queryClient.prefetchQuery({
    queryKey: [key],
    queryFn: () =>
      new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      }),
    retry: false,
  });

  return { resolve: (data: unknown) => resolve(data), reject: (error: Error) => reject(error) };
};

const createControlledInfiniteQuery = (queryClient: QueryClient, key: string) => {
  let resolve: (data: unknown) => void = () => {};

  queryClient.prefetchInfiniteQuery({
    queryKey: [key],
    queryFn: () =>
      new Promise((res) => {
        resolve = res;
      }),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.length,
    retry: false,
  });

  return { resolve: (data: unknown) => resolve(data) };
};

const setup = () => {
  const queryClient = new QueryClient();
  const streaming = createFakeStreaming();

  const dehydrate = () =>
    dehydrateWithStreaming({
      queryClient,
      propKey: PROP_KEY,
      transport: streaming.transport,
      log: { debug: jest.fn(), warn: jest.fn() } as any,
    });

  const clientQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // default retries must not be used for streamed queries
        retry: 3,
        retryDelay: 10000,
        // used by refetches without mounted components
        queryFn: ({ pageParam }) => `client page ${pageParam ?? ''}`.trim(),
      },
    },
  });

  const startClient = (state: any) => {
    subscribeToLateQueries(clientQueryClient, PROP_KEY, streaming.registry);
    // the rest of the state is hydrated by `HydrationBoundary`
    hydrate(
      clientQueryClient,
      hydrateStreamedQueries(
        JSON.parse(JSON.stringify(state)),
        PROP_KEY,
        clientQueryClient,
        streaming.registry
      )
    );
  };

  return { queryClient, clientQueryClient, dehydrate, startClient, ...streaming };
};

describe('react-query streaming', () => {
  it('streams query which is in flight at dehydration', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
      setup();
    const query = createControlledQuery(queryClient, 'pending');

    const state = dehydrate();

    expect(state.queries).toHaveLength(1);
    expect(state.queries[0]).toMatchObject({ __tramvaiStreamed: true, state: { status: 'pending' } });
    expect(state.queries[0]).not.toHaveProperty('promise');

    startClient(state);

    // hydrated query waits for the streamed result
    expect(clientQueryClient.getQueryState(['pending'])?.fetchStatus).toBe('fetching');

    query.resolve({ value: 'data' });
    await settle();
    executeScripts();
    await flush();

    expect(clientQueryClient.getQueryData(['pending'])).toEqual({ value: 'data' });
  });

  it('streamed result can arrive before client code', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
      setup();
    const query = createControlledQuery(queryClient, 'early');
    const state = dehydrate();

    query.resolve('data');
    await settle();
    executeScripts();
    startClient(state);
    await flush();

    expect(clientQueryClient.getQueryData(['early'])).toBe('data');
  });

  it('streams queries settled long before the response stream is started', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
      setup();
    const pending = createControlledQuery(queryClient, 'settled-pending');
    const state = dehydrate();
    const late = createControlledQuery(queryClient, 'settled-late');

    pending.resolve('pending data');
    late.resolve('late data');
    // react-query drops settled query promise
    await flush();
    await settle();
    executeScripts();
    startClient(state);
    await flush();

    expect(clientQueryClient.getQueryData(['settled-pending'])).toBe('pending data');
    expect(clientQueryClient.getQueryData(['settled-late'])).toBe('late data');
  });

  describe('failed queries', () => {
    const mountComponent = (clientQueryClient: QueryClient, key: string) => {
      const queryFn = jest.fn(async () => 'client data');
      const observer = new QueryObserver(clientQueryClient, {
        queryKey: [key],
        queryFn,
        // component options are used instead of the defaults
        retry: false,
      });
      const results: string[] = [];
      const unsubscribe = observer.subscribe((result) => results.push(result.status));

      return { queryFn, observer, results, unsubscribe };
    };

    it('streams rejection without error details', async () => {
      const { queryClient, dehydrate, settle, scripts } = setup();
      const query = createControlledQuery(queryClient, 'failed');

      dehydrate();
      query.reject(new Error('internal backend details'));
      await settle();

      expect(scripts.map((script) => script.type)).toEqual(['reject']);
    });

    it('mounted component fetches the query with its own options', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();
      const query = createControlledQuery(queryClient, 'failed');

      startClient(dehydrate());

      const component = mountComponent(clientQueryClient, 'failed');

      // waits for the streamed result instead of fetching
      expect(component.queryFn).not.toHaveBeenCalled();

      query.reject(new Error('backend error'));
      await settle();
      executeScripts();
      await flush();
      await flush();

      expect(component.queryFn).toHaveBeenCalledTimes(1);
      expect(clientQueryClient.getQueryData(['failed'])).toBe('client data');
      // error state is never shown
      expect(component.results).not.toContain('error');

      component.unsubscribe();
    });

    it('not mounted query is reverted to pending state and fetched on mount', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();
      const query = createControlledQuery(queryClient, 'failed');

      startClient(dehydrate());
      query.reject(new Error('backend error'));
      await settle();
      executeScripts();
      await flush();

      expect(clientQueryClient.getQueryState(['failed'])).toMatchObject({
        status: 'pending',
        fetchStatus: 'idle',
        error: null,
      });

      const component = mountComponent(clientQueryClient, 'failed');

      await flush();

      expect(component.queryFn).toHaveBeenCalledTimes(1);
      expect(clientQueryClient.getQueryData(['failed'])).toBe('client data');

      component.unsubscribe();
    });

    it('rejection which arrived before client code', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();
      const query = createControlledQuery(queryClient, 'failed');
      const state = dehydrate();

      query.reject(new Error('backend error'));
      await settle();
      executeScripts();
      startClient(state);
      await flush();

      expect(clientQueryClient.getQueryState(['failed'])).toMatchObject({
        status: 'pending',
        fetchStatus: 'idle',
        error: null,
      });
    });

    it('late query falls back to client fetch', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();

      startClient(dehydrate());

      const query = createControlledQuery(queryClient, 'late-failed');

      await flush();
      executeScripts();

      const component = mountComponent(clientQueryClient, 'late-failed');

      query.reject(new Error('backend error'));
      await settle();
      executeScripts();
      await flush();
      await flush();

      expect(component.queryFn).toHaveBeenCalledTimes(1);
      expect(clientQueryClient.getQueryData(['late-failed'])).toBe('client data');

      component.unsubscribe();
    });
  });

  it('does not stream resolved queries', async () => {
    const { queryClient, dehydrate, settle, scripts } = setup();

    queryClient.setQueryData(['resolved'], 'data');

    const state = dehydrate();

    await settle();

    expect(state.queries[0]).not.toHaveProperty('__tramvaiStreamed');
    expect(scripts).toHaveLength(0);
  });

  it('streams query started after dehydration', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts, scripts } =
      setup();
    const state = dehydrate();

    // e.g. started by suspended component during render
    const query = createControlledQuery(queryClient, 'late');

    query.resolve('late data');
    await settle();

    expect(state.queries).toHaveLength(0);
    expect(scripts.map((script) => script.type)).toEqual(['emit', 'resolve']);

    executeScripts();
    startClient(state);
    await flush();

    expect(clientQueryClient.getQueryData(['late'])).toBe('late data');
  });

  it('late query is hydrated when client is already started', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
      setup();
    const state = dehydrate();

    startClient(state);

    const query = createControlledQuery(queryClient, 'late');

    await flush();
    // pending state arrives first, client knows that the query is in flight
    executeScripts();

    expect(clientQueryClient.getQueryState(['late'])?.fetchStatus).toBe('fetching');

    query.resolve('late data');
    await settle();
    executeScripts();
    await flush();

    expect(clientQueryClient.getQueryData(['late'])).toBe('late data');
  });

  it('late query does not interrupt the query, which is already fetched by the client', async () => {
    const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
      setup();

    startClient(dehydrate());

    const clientFetch = clientQueryClient.fetchQuery({
      queryKey: ['late'],
      queryFn: () => new Promise((resolve) => setTimeout(() => resolve('client data'), 10)),
    });
    const query = createControlledQuery(queryClient, 'late');

    await flush();
    executeScripts();
    query.reject(new Error('backend error'));
    await settle();
    executeScripts();

    await expect(clientFetch).resolves.toBe('client data');
  });

  it('does not stream late queries after response is finished', async () => {
    const { queryClient, dehydrate, settle, scripts, finish } = setup();

    dehydrate();
    finish();
    createControlledQuery(queryClient, 'too-late');
    await settle();

    expect(scripts).toHaveLength(0);
  });

  describe('infinite queries', () => {
    const expectInfiniteBehavior = async (clientQueryClient: QueryClient, key: string) => {
      expect(clientQueryClient.getQueryCache().find({ queryKey: [key] })?.queryType).toBe(
        'infinite'
      );

      // refetch without mounted component, e.g. retry after streamed error,
      // must keep infinite data shape instead of replacing it with a single page
      await clientQueryClient.refetchQueries({ queryKey: [key] });

      expect(clientQueryClient.getQueryData([key])).toEqual({
        pages: ['client page 0'],
        pageParams: [0],
      });
    };

    it('streams infinite query which is in flight at dehydration', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();
      const query = createControlledInfiniteQuery(queryClient, 'infinite');
      const state = dehydrate();

      expect(state.queries[0]).toMatchObject({ queryType: 'infinite', __tramvaiStreamed: true });

      startClient(state);
      query.resolve('server page 0');
      await settle();
      executeScripts();
      await flush();

      expect(clientQueryClient.getQueryData(['infinite'])).toEqual({
        pages: ['server page 0'],
        pageParams: [0],
      });

      await expectInfiniteBehavior(clientQueryClient, 'infinite');
    });

    it('streams infinite query started after dehydration', async () => {
      const { queryClient, clientQueryClient, dehydrate, startClient, settle, executeScripts } =
        setup();
      const state = dehydrate();
      const query = createControlledInfiniteQuery(queryClient, 'late-infinite');

      query.resolve('server page 0');
      await settle();
      executeScripts();
      startClient(state);
      await flush();

      expect(clientQueryClient.getQueryData(['late-infinite'])).toEqual({
        pages: ['server page 0'],
        pageParams: [0],
      });

      await expectInfiniteBehavior(clientQueryClient, 'late-infinite');
    });
  });
});
