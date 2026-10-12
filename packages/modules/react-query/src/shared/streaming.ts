import type { DehydratedState, QueryClient } from '@tanstack/react-query';
import { hydrate } from '@tanstack/react-query';
import type { StreamingTransportRegistry } from '@tramvai/tokens-render';

/**
 * Replaces the in-flight promise of a pending query in the dehydrated state,
 * because promise can't be serialized to JSON - result will be streamed separately
 */
export const STREAMED_QUERY_MARKER = '__tramvaiStreamed';

/**
 * Host app and every child app have their own QueryClient, so `propKey` is used as a namespace
 */
export const getStreamKey = (propKey: string, queryHash: string) =>
  `react-query:${propKey}:${queryHash}`;

export const getLateQueriesChannel = (propKey: string) => `react-query:${propKey}`;

/**
 * Query failed at server-side (or exceeded response stream timeout).
 * The hydrated fetch was created with default options, so instead of its retries,
 * the query is reverted to the state without data and fetched with the options of the components
 */
const fallbackToClientFetch = (queryClient: QueryClient, queryHash: string, error: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      `[react-query] Streamed query ${queryHash} failed at server-side, it will be fetched at client-side`,
      error
    );
  }

  const query = queryClient.getQueryCache().get(queryHash);

  if (!query) {
    return;
  }

  // reverts to the hydrated pending state, without error state and default retries
  query.cancel({ revert: true });
  // mounted components fetch the query with their own options, the others will fetch it on mount
  queryClient.refetchQueries({ queryKey: query.queryKey, exact: true, type: 'active' });
};

/**
 * Streamed queries are hydrated immediately, not by `HydrationBoundary` during render,
 * so the query is always in the cache when its streamed result is rejected
 */
const hydrateStreamedQuery = (
  queryClient: QueryClient,
  dehydratedQuery: any,
  propKey: string,
  registry: StreamingTransportRegistry
) => {
  const { [STREAMED_QUERY_MARKER]: _, ...query } = dehydratedQuery;

  // late query can arrive when the client already fetches it, e.g. after hydration of `useQuery` component
  if (queryClient.getQueryCache().get(query.queryHash)?.state.fetchStatus === 'fetching') {
    return;
  }

  const result = registry.get(getStreamKey(propKey, query.queryHash));

  // handler is attached before react-query handlers, so the query is reverted before its retries
  result.catch((error) => fallbackToClientFetch(queryClient, query.queryHash, error));

  hydrate(queryClient, { mutations: [], queries: [{ ...query, promise: result }] });
};

/**
 * Hydrates streamed queries, the rest of the state is returned for `HydrationBoundary`.
 * Without registry, streamed queries are hydrated as pending and will be fetched at client-side.
 */
export const hydrateStreamedQueries = (
  state: DehydratedState,
  propKey: string,
  queryClient: QueryClient,
  registry: StreamingTransportRegistry | null
): DehydratedState => {
  const queries = (state.queries ?? []).filter((query: any) => {
    if (!query[STREAMED_QUERY_MARKER]) {
      return true;
    }

    if (!registry) {
      delete query[STREAMED_QUERY_MARKER];
      return true;
    }

    hydrateStreamedQuery(queryClient, query, propKey, registry);
    return false;
  });

  return { ...state, queries };
};

/**
 * Hydrate queries, which were started at server-side after dehydration, as soon as they arrive with the stream
 */
export const subscribeToLateQueries = (
  queryClient: QueryClient,
  propKey: string,
  registry: StreamingTransportRegistry
) => {
  registry.subscribe(getLateQueriesChannel(propKey), (dehydratedQuery) => {
    hydrateStreamedQuery(queryClient, dehydratedQuery, propKey, registry);
  });
};
