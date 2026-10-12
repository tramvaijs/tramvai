import identity from '@tinkoff/utils/function/identity';
import type {
  QueryKey,
  UseInfiniteQueryOptions,
  InfiniteQueryObserverOptions,
} from '@tanstack/react-query';
import type { ActionContext } from '@tramvai/core';
import { declareAction } from '@tramvai/core';
import { QUERY_CLIENT_TOKEN } from '@tramvai/module-react-query';
import { CONTEXT_TOKEN, LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { Container, ProviderDeps } from '@tinkoff/dippy';
import { DI_TOKEN } from '@tinkoff/dippy';
import type { CreateInfiniteQueryOptions, InfiniteQuery } from './types';
import type { ReactQueryContext, ReactQueryKeyOrString } from '../baseQuery/types';
import { QUERY_PARAMETERS } from '../baseQuery/types';
import { normalizeKey } from '../shared/normalizeKey';
import { resolveDI } from '../shared/resolveDI';
import { mapQuerySignalToxecutionContext } from '../shared/signal';
import { createUniqueActionKeyForQuery } from '../shared/createUniqueActionKeyForQuery';
import { createPrefetchAction, warnDeferredFetchAction } from '../shared/prefetchAction';

// `UseInfiniteQueryOptions` types is incompatible between v4 and v5 (`initialPageParam` is required only in v5)
// also, this helper will work properly only for v4 or >=5.80,
// because for >=5 <5.80 range there is 6 generic parameters in `UseInfiniteQueryOptions`
export type SafeUseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = InfiniteQueryObserverOptions extends { initialPageParam: unknown }
  ? UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
  : // @ts-expect-error backward compatibility with RQ v4
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TData, TQueryKey>;

const convertToRawQuery = <Options, PageParam, Result, Deps extends ProviderDeps>(
  query: InfiniteQuery<Options, PageParam, Result, Deps>,
  di: Container,
  options: Options
): SafeUseInfiniteQueryOptions<Result, Error, Result, QueryKey, PageParam> => {
  const {
    key = identity,
    fn,
    // TODO: remove after dropping support @tanstack/react-query v4
    initialPageParam = 0 as PageParam,
    getNextPageParam = () => null,
    getPreviousPageParam,
    deps = {},
    conditions,
    infiniteQueryOptions,
  } = query[QUERY_PARAMETERS];
  const resolvedDeps = di.getOfDeps(deps as Deps);
  const ctx: ReactQueryContext<Deps> = { deps: resolvedDeps };

  const rawQueryKey = typeof key === 'function' ? key.call(ctx, options) : key;
  const queryKey = normalizeKey(rawQueryKey as ReactQueryKeyOrString);

  const actionWrapper = declareAction({
    name: `infiniteQueryExecution:${query.actionNamePostfix}`,
    async fn(queryContext: { pageParam?: PageParam; signal?: AbortSignal }) {
      const { abortSignal, abortController } = this;

      mapQuerySignalToxecutionContext(queryContext, this);

      return fn.call(
        { ...ctx, abortSignal, abortController },
        options,
        queryContext.pageParam!,
        ctx.deps
      );
    },
    conditionsFailResult: 'reject',
    deps,
    conditions,
  });

  return {
    ...infiniteQueryOptions,
    initialPageParam,
    getNextPageParam,
    getPreviousPageParam,
    queryKey,
    tramvaiOptions: {
      conditions,
    },
    queryFn: (queryContext) => {
      const context = di.get(CONTEXT_TOKEN);
      // @ts-expect-error TODO: remove comment after drop support for @tanstack/react-query v4
      return context.executeAction(actionWrapper, queryContext);
    },
  };
};
export const createInfiniteQuery = <
  Options,
  Result,
  Deps extends ProviderDeps = {},
  PageParam = unknown,
>(
  queryParameters: CreateInfiniteQueryOptions<Options, PageParam, Result, Deps>
): InfiniteQuery<Options, PageParam, Result, Deps> => {
  const { infiniteQueryOptions, conditions } = queryParameters;

  const query: InfiniteQuery<Options, PageParam, Result, Deps> = {
    [QUERY_PARAMETERS]: queryParameters,
    actionNamePostfix: createUniqueActionKeyForQuery(queryParameters),
    fork: (
      options: Partial<SafeUseInfiniteQueryOptions<Result, Error, Result, QueryKey, PageParam>>
    ) => {
      return createInfiniteQuery({
        ...queryParameters,
        infiniteQueryOptions: {
          ...infiniteQueryOptions,
          ...options,
        },
      });
    },
    raw: (diOrContext: ActionContext | Container, options: Options) => {
      return convertToRawQuery(query, resolveDI(diOrContext), options);
    },
    prefetchAction: (options: Options, { deferred = queryParameters.deferred ?? false } = {}) => {
      return createPrefetchAction({
        name: `infiniteQueryPrefetch:${query.actionNamePostfix}`,
        conditions,
        deferred,
        getQueryOptions: (di) => convertToRawQuery(query, di, options),
        prefetch: (queryClient, rawQuery) => queryClient.prefetchInfiniteQuery(rawQuery),
      });
    },
    fetchAction: (options: Options) => {
      return declareAction({
        name: `infiniteQueryFetch:${query.actionNamePostfix}`,
        fn() {
          warnDeferredFetchAction(this.deps.logger, {
            deferred: queryParameters.deferred,
            actionNamePostfix: query.actionNamePostfix,
          });

          return this.deps.queryClient.fetchInfiniteQuery(
            convertToRawQuery(query, this.deps.di, options)
          );
        },
        deps: {
          di: DI_TOKEN,
          queryClient: QUERY_CLIENT_TOKEN,
          logger: LOGGER_TOKEN,
        },
        conditions,
      });
    },
  };

  return query;
};
