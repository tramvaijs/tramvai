import { createToken } from '@tinkoff/dippy';
import type { ActionConditionsParameters } from '@tramvai/core';
import type { QueryClient, DefaultOptions, DehydratedState } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface QueryOptions {
    // settings custom options for the query that might be used later in the tramvai modules
    tramvaiOptions?: {
      conditions?: ActionConditionsParameters;
    };
  }
}

/**
 * @description
 * [react-query client](https://tanstack.com/query/v4/docs/reference/QueryClient)
 */

export const QUERY_CLIENT_TOKEN = createToken<QueryClient>('reactQuery queryClient');

/**
 * @description
 * [default options for the react-query](https://tanstack.com/query/v4/docs/guides/important-defaults)
 */
export const QUERY_CLIENT_DEFAULT_OPTIONS_TOKEN = createToken<DefaultOptions>(
  'reactQuery queryClientDefaultOptions'
);

/**
 * @description
 * [react-query state](https://tanstack.com/query/v4/docs/reference/hydration#dehydrate) that was initialized on the server
 */
export const QUERY_CLIENT_DEHYDRATED_STATE_TOKEN = createToken<DehydratedState>(
  'reactQuery queryClientDehydratedState'
);

export const QUERY_DEHYDRATE_STATE_NAME_TOKEN = createToken<string>(
  'reactQuery dehydrate state name'
);

/**
 * @description
 * Enables streaming of deferred queries, `false` by default.
 * Requires streaming rendering (`REACT_SERVER_RENDER_MODE` is `streaming`) and `@tanstack/react-query@>=5.100.2`
 */
export const QUERY_STREAMING_ENABLED_TOKEN = createToken<boolean>('reactQuery streaming enabled');

/**
 * @description
 * `true` when queries, which are still in flight at server-side dehydration, are streamed to the client in the current request:
 * streaming is enabled by `QUERY_STREAMING_ENABLED_TOKEN` and the response is streamed.
 * Deferred queries prefetch is not awaited only in this case, otherwise they behave as regular ones.
 * Computed value, use `QUERY_STREAMING_ENABLED_TOKEN` to enable streaming
 */
export const QUERY_STREAMING_ACTIVE_TOKEN = createToken<boolean>('reactQuery streaming active');
