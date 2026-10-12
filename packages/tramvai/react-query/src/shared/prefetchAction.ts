import type { QueryClient } from '@tanstack/react-query';
import type { Container } from '@tinkoff/dippy';
import { DI_TOKEN } from '@tinkoff/dippy';
import type { ActionConditionsParameters } from '@tramvai/core';
import { declareAction, optional } from '@tramvai/core';
import { QUERY_CLIENT_TOKEN, QUERY_STREAMING_ACTIVE_TOKEN } from '@tramvai/module-react-query';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';

declare module '@tramvai/tokens-common' {
  interface AsyncLocalStorageState {
    isDeferredExecution?: boolean;
  }
}

export interface PrefetchActionConfig {
  /**
   * Do not wait for the query in page actions:
   * - at server-side with streaming rendering, query result will be streamed to the client
   * - at client-side, page transition is not blocked
   *
   * Without streaming rendering, query is awaited as a regular one.
   *
   * @default value of `deferred` option of the query
   */
  deferred?: boolean;
}

/**
 * Failed streamed query is fetched again at client-side, so server-side retries only delay this fallback,
 * and usually do not fit into the response stream timeout. Retries are kept only when they are set explicitly for the query.
 */
const withoutDefaultRetry = <T extends { retry?: unknown }>(options: T): T =>
  options.retry === undefined ? { ...options, retry: false } : options;

export const createPrefetchAction = <Options extends { retry?: unknown }>({
  name,
  conditions,
  deferred,
  getQueryOptions,
  prefetch,
}: {
  name: string;
  conditions?: ActionConditionsParameters;
  deferred: boolean;
  getQueryOptions: (di: Container) => Options;
  prefetch: (queryClient: QueryClient, options: Options) => Promise<void>;
}) =>
  declareAction({
    name,
    fn() {
      const { queryClient, di, streamingActive, storage } = this.deps;
      const isServer = typeof window === 'undefined';
      const options = getQueryOptions(di);

      if (!deferred || (isServer && !streamingActive)) {
        return prefetch(queryClient, options);
      }

      const run = () => {
        prefetch(queryClient, isServer ? withoutDefaultRetry(options) : options);
      };

      // mark execution as deferred, so state changes inside the query will be streamed too
      if (storage) {
        storage.run({ ...storage.getStore(), isDeferredExecution: true }, run);
      } else {
        run();
      }

      return Promise.resolve();
    },
    deps: {
      di: DI_TOKEN,
      queryClient: QUERY_CLIENT_TOKEN,
      streamingActive: optional(QUERY_STREAMING_ACTIVE_TOKEN),
      storage: optional(ASYNC_LOCAL_STORAGE_TOKEN),
    },
    conditions,
  });

const warnedQueries = new Set<string>();

/**
 * `fetchAction` result is used by the caller, so it can't be deferred
 */
export const warnDeferredFetchAction = (
  logger: typeof LOGGER_TOKEN,
  { deferred, actionNamePostfix }: { deferred?: boolean; actionNamePostfix: string }
) => {
  if (process.env.NODE_ENV !== 'production' && deferred && !warnedQueries.has(actionNamePostfix)) {
    warnedQueries.add(actionNamePostfix);
    logger('react-query').warn(
      `"deferred" option is ignored for "fetchAction" of "${actionNamePostfix}" query, because its result is awaited by the caller. Use "prefetchAction" for deferred queries`
    );
  }
};
