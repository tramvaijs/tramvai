import type { ProvideDepsIterator, ProviderDeps } from '@tinkoff/dippy';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { TramvaiAction } from '@tramvai/core';
import type { BaseCreateQueryOptions, BaseQuery, ReactQueryContext } from '../baseQuery/types';
import { SafeUseInfiniteQueryOptions } from './create';

export type CreateInfiniteQueryOptions<
  Options,
  PageParam,
  Result,
  Deps extends ProviderDeps,
> = BaseCreateQueryOptions<Options, Deps> & {
  infiniteQueryOptions?: Partial<
    SafeUseInfiniteQueryOptions<Result, Error, Result, QueryKey, PageParam>
  >;

  fn: (
    this: ReactQueryContext<Deps>,
    options: Options,
    pageParam: PageParam,
    /**
     * @deprecated use this.deps instead
     */
    deps: ProvideDepsIterator<Deps>
  ) => Promise<Result>;

  initialPageParam?: PageParam;
  getNextPageParam?: (lastPage: Result, allPages: Result[]) => PageParam | undefined | null;
  getPreviousPageParam?: (firstPage: Result, allPages: Result[]) => PageParam | undefined | null;
};

export type InfiniteQuery<Options, PageParam, Result, Deps extends ProviderDeps> = BaseQuery<
  Options,
  CreateInfiniteQueryOptions<Options, PageParam, Result, Deps>,
  InfiniteQuery<Options, PageParam, Result, Deps>,
  SafeUseInfiniteQueryOptions<Result, Error, Result, QueryKey, PageParam>
> & {
  fetchAction(options?: Options): TramvaiAction<[], Promise<InfiniteData<Result>>, any>;
};
