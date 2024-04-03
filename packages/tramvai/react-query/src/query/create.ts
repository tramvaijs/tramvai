import identity from '@tinkoff/utils/function/identity';
import type { ProviderDeps } from '@tinkoff/dippy';
import { DI_TOKEN } from '@tinkoff/dippy';
import type { Container } from '@tinkoff/dippy';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ActionContext } from '@tramvai/core';
import { declareAction } from '@tramvai/core';
import { QUERY_CLIENT_TOKEN } from '@tramvai/module-react-query';
import { CONTEXT_TOKEN, LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { CreateQueryOptions, Query } from './types';
import type { ReactQueryContext, ReactQueryKeyOrString } from '../baseQuery/types';
import { QUERY_PARAMETERS } from '../baseQuery/types';
import { normalizeKey } from '../shared/normalizeKey';
import { resolveDI } from '../shared/resolveDI';
import { mapQuerySignalToxecutionContext } from '../shared/signal';
import { createUniqueActionKeyForQuery } from '../shared/createUniqueActionKeyForQuery';

const convertToRawQuery = <Options, Result, Deps extends ProviderDeps>(
  query: Query<Options, Result, Deps>,
  di: Container,
  options: Options
): UseQueryOptions<Result, Error> => {
  const { key = identity, fn, deps = {}, conditions, queryOptions } = query[QUERY_PARAMETERS];
  const resolvedDeps = di.getOfDeps(deps as Deps);
  const ctx: ReactQueryContext<Deps> = { deps: resolvedDeps };

  const rawQueryKey = typeof key === 'function' ? key.call(ctx, options) : key;
  const queryKey = normalizeKey(rawQueryKey as ReactQueryKeyOrString);

  const actionWrapper = declareAction({
    name: `queryExecution:${query.actionNamePostfix}`,
    async fn(queryContext: { signal?: AbortSignal }) {
      const { abortSignal, abortController } = this;

      mapQuerySignalToxecutionContext(queryContext, this);

      return fn.call({ ...ctx, abortSignal, abortController }, options, ctx.deps);
    },
    deps,
    conditions,
    conditionsFailResult: 'reject',
  });

  return {
    ...queryOptions,
    queryKey,
    tramvaiOptions: {
      conditions,
    },
    queryFn: (queryContext) => {
      const context = di.get(CONTEXT_TOKEN);
      return context.executeAction(actionWrapper, queryContext);
    },
  };
};

export const createQuery = <Options = unknown, Result = unknown, Deps extends ProviderDeps = {}>(
  queryParameters: CreateQueryOptions<Options, Result, Deps>
): Query<Options, Result, Deps> => {
  const { queryOptions, conditions } = queryParameters;

  const query: Query<Options, Result, Deps> = {
    [QUERY_PARAMETERS]: queryParameters,
    actionNamePostfix: createUniqueActionKeyForQuery(queryParameters),
    fork: (options: UseQueryOptions<Result, Error>) => {
      return createQuery({
        ...queryParameters,
        queryOptions: {
          ...queryOptions,
          ...options,
        },
      });
    },
    raw: (diOrContext: ActionContext | Container, options: Options) => {
      return convertToRawQuery(query, resolveDI(diOrContext), options);
    },
    prefetchAction: (options: Options) => {
      return declareAction({
        name: `queryPrefetch:${query.actionNamePostfix}`,
        fn() {
          return this.deps.queryClient.prefetchQuery(
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
        name: `queryFetch:${query.actionNamePostfix}`,
        fn() {
          return this.deps.queryClient.fetchQuery(convertToRawQuery(query, this.deps.di, options));
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
