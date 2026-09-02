import identity from '@tinkoff/utils/function/identity';
import type { QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
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

// `UseInfiniteQueryOptions` generic parameters are incompatible between the supported RQ versions:
// - v4:        `<TQueryFnData, TError, TData, TQueryData, TQueryKey>`
// - >=5 <5.80: `<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>`
// - >=5.80:    `<TQueryFnData, TError, TData, TQueryKey, TPageParam>`
//
// So we detect the layout by instantiating `UseInfiniteQueryOptions` with a marker type in the
// 5th slot and checking whether it lands on `initialPageParam`. Sniffing for a specific RQ
// feature instead is not reliable - e.g. `experimental_prefetchInRender`, used here before,
// was removed in RQ 5.9x and silently switched the whole type to the v4 layout.
//
// The marker is a valid `QueryKey`, so it doesn't violate the `TQueryKey extends QueryKey`
// constraint on the layouts where the 5th slot is `TQueryKey`.
interface PageParamProbe {
  readonly __tramvaiPageParamProbe: true;
}

type IsPageParamFifthGenericParameter = UseInfiniteQueryOptions<
  unknown,
  Error,
  unknown,
  QueryKey,
  readonly [PageParamProbe]
> extends { initialPageParam?: readonly [PageParamProbe] }
  ? true
  : false;

// this helper works properly only for v4 or >=5.80, for the >=5 <5.80 range it falls back
// to the v4 layout.
// `@ts-ignore` (and not `@ts-expect-error`) is required on both branches: only one of them is
// valid for the currently installed RQ version, and the other one violates the
// `TQueryKey extends QueryKey` constraint.
export type SafeUseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = IsPageParamFifthGenericParameter extends true
  ? // @ts-ignore RQ >=5.80
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
  : // @ts-ignore backward compatibility with RQ v4
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
    prefetchAction: (options: Options) => {
      return declareAction({
        name: `infiniteQueryPrefetch:${query.actionNamePostfix}`,
        fn() {
          return this.deps.queryClient.prefetchInfiniteQuery(
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
    fetchAction: (options: Options) => {
      return declareAction({
        name: `infiniteQueryFetch:${query.actionNamePostfix}`,
        fn() {
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
