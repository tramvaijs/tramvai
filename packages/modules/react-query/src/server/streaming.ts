import type { DehydratedState, Query, QueryClient } from '@tanstack/react-query';
import { dehydrate, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { StreamingTransport } from '@tramvai/tokens-render';
import { getLateQueriesChannel, getStreamKey, STREAMED_QUERY_MARKER } from '../shared/streaming';

type Logger = ReturnType<ExtractDependencyType<typeof LOGGER_TOKEN>>;

export interface StreamingDeps {
  queryClient: QueryClient;
  propKey: string;
  transport: StreamingTransport;
  log: Logger;
}

const isInFlight = (query: Query<any, any, any, any>) =>
  query.state.fetchStatus === 'fetching' && query.state.data === undefined;

/**
 * Promise can't be serialized to JSON, it is replaced with a marker - result will be streamed separately
 */
const markStreamed = (dehydratedQuery: any) => {
  // eslint-disable-next-line no-param-reassign
  delete dehydratedQuery.promise;
  // eslint-disable-next-line no-param-reassign
  dehydratedQuery[STREAMED_QUERY_MARKER] = true;
};

/**
 * react-query drops the retryer (and its promise) right after the query is settled,
 * so for already settled queries the result is taken from the state
 */
const getQueryResult = (query: Query<any, any, any, any>): Promise<unknown> => {
  if (query.promise) {
    return query.promise;
  }

  if (query.state.status === 'success') {
    return Promise.resolve(query.state.data);
  }

  return Promise.reject(query.state.error ?? new Error('Query result is not found'));
};

/**
 * Streams query result, when the query is settled
 */
const streamQueryResult = (
  { propKey, transport, log }: StreamingDeps,
  query: Query<any, any, any, any>,
  { justStarted = false }: { justStarted?: boolean } = {}
) => {
  // promise must be captured before the query is settled.
  // For just started queries, promise is created right after the fetch event
  const result = justStarted
    ? Promise.resolve().then(() => getQueryResult(query))
    : getQueryResult(query);

  transport.stream(
    getStreamKey(propKey, query.queryHash),
    result.catch((error) => {
      log.debug({
        event: 'streamed-query-failed',
        queryHash: query.queryHash,
        error: error as Error,
      });

      throw error;
    })
  );
};

/**
 * Queries can be started after dehydration: by suspended components during render, or by nested queries.
 * Pending state is streamed immediately (so the client will not fetch the query itself), and the result after it.
 */
const streamLateQueries = (deps: StreamingDeps, alreadyDehydrated: Set<string>) => {
  const { queryClient, propKey, transport } = deps;

  const unsubscribe = queryClient.getQueryCache().subscribe(({ query }) => {
    if (alreadyDehydrated.has(query.queryHash) || !isInFlight(query)) {
      return;
    }

    alreadyDehydrated.add(query.queryHash);

    // the same format as for the main state, e.g. infinite queries keep their type
    const [dehydratedQuery] = dehydrate(queryClient, {
      shouldDehydrateQuery: (cachedQuery) => cachedQuery === query,
      shouldRedactErrors: () => false,
    } as Parameters<typeof dehydrate>[1]).queries;

    markStreamed(dehydratedQuery);
    transport.emit(getLateQueriesChannel(propKey), dehydratedQuery);
    streamQueryResult(deps, query, { justStarted: true });
  });

  transport.onFinish(unsubscribe);
};

/**
 * Dehydrates query client with queries which are still in flight.
 * Their promises are replaced with a marker, and results are streamed later.
 * Queries started after dehydration are streamed too.
 *
 * Relies on `@tanstack/react-query@>=5.100.2`: pending queries are dehydrated with promises since 5.40.0,
 * and infinite queries keep their behavior after hydration since 5.100.2.
 */
export const dehydrateWithStreaming = (deps: StreamingDeps): DehydratedState => {
  const { queryClient } = deps;
  const state = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || isInFlight(query),
    // dehydrated promises are not sent to the client, errors are not streamed,
    // also it prevents react-query warnings about rejected pending queries
    shouldRedactErrors: () => false,
  } as Parameters<typeof dehydrate>[1]);
  const queryCache = queryClient.getQueryCache();
  const dehydratedHashes = new Set<string>(state.queries.map((query) => query.queryHash));

  const queries = state.queries.filter((dehydratedQuery) => {
    const query = queryCache.get(dehydratedQuery.queryHash);

    if (!query || !isInFlight(query)) {
      return true;
    }

    if (!query.promise) {
      return false;
    }

    streamQueryResult(deps, query);
    markStreamed(dehydratedQuery);

    return true;
  });

  streamLateQueries(deps, dehydratedHashes);

  return { ...state, queries };
};
