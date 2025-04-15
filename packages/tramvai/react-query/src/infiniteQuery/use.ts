import { useMemo } from 'react';
import type {
  InfiniteData,
  InfiniteQueryObserverResult,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery as useOriginalInfiniteQuery } from '@tanstack/react-query';
import type { ProviderDeps } from '@tinkoff/dippy';
import { useDiContainer } from '@tramvai/react';
import type { InfiniteQuery } from './types';
import { isQuery } from '../baseQuery/types';

// Different types for useInfiniteQuery result between v4 and v5
type SafeUnpackUseInfiniteQueryResult<
  Result,
  Error,
  T extends UseInfiniteQueryResult<Result, Error>,
  // `data` resolved as `InfiniteData<Result> | undefined` in v4
> = T['data'] extends InfiniteData<Result> | undefined
  ? UseInfiniteQueryResult<Result, Error>
  : UseInfiniteQueryResult<InfiniteData<Result>, Error>;

function useInfiniteQuery<Options extends void, PageParam, Result, Deps extends ProviderDeps>(
  query:
    | UseInfiniteQueryOptions<Result, Error, Result, Result, QueryKey, PageParam>
    | InfiniteQuery<Options, PageParam, Result, Deps>
): SafeUnpackUseInfiniteQueryResult<Result, Error, UseInfiniteQueryResult<Result, Error>>;
function useInfiniteQuery<Options, PageParam, Result, Deps extends ProviderDeps>(
  query:
    | UseInfiniteQueryOptions<Result, Error, Result, Result, QueryKey, PageParam>
    | InfiniteQuery<Options, PageParam, Result, Deps>,
  options: Options
): SafeUnpackUseInfiniteQueryResult<Result, Error, UseInfiniteQueryResult<Result, Error>>;
function useInfiniteQuery<Options, PageParam, Result, Deps extends ProviderDeps>(
  query:
    | UseInfiniteQueryOptions<Result, Error, Result, Result, QueryKey, PageParam>
    | InfiniteQuery<Options, PageParam, Result, Deps>,
  options?: Options
): SafeUnpackUseInfiniteQueryResult<Result, Error, UseInfiniteQueryResult<Result, Error>> {
  const di = useDiContainer();
  const resultQuery = useMemo(() => {
    if (isQuery(query)) {
      return query.raw(di, options as Options);
    }

    return query;
  }, [query, di, options]);

  // @ts-expect-error TODO: remove comment after drop support for @tanstack/react-query v4
  return useOriginalInfiniteQuery<Result, Error, Result, QueryKey>(resultQuery);
}

export { useInfiniteQuery };
