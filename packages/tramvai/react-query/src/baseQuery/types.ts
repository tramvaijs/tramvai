import type { ActionConditionsParameters, ActionContext, TramvaiAction } from '@tramvai/core';
import type { QueryKey as ReactQueryKey, QueryOptions } from '@tanstack/react-query';
import type { Container, ProvideDepsIterator, ProviderDeps } from '@tinkoff/dippy';

export const QUERY_PARAMETERS = '__query_parameters__';

export interface ReactQueryContext<Deps extends ProviderDeps> {
  deps: ProvideDepsIterator<Deps>;
  abortController?: AbortController;
  abortSignal?: AbortSignal;
}

export type ReactQueryKeyOrString = ReactQueryKey | string;

export type QueryKey<Options, Deps extends ProviderDeps> =
  | ((this: ReactQueryContext<Deps>, options: Options) => ReactQueryKeyOrString)
  | ReactQueryKeyOrString;

export type CreateQueryOptionsWithSerializableKey<Options, Deps extends ProviderDeps> = {
  key: ReactQueryKeyOrString;

  actionNamePostfix?: string;

  fn: Function;

  deps?: Deps;

  conditions?: ActionConditionsParameters;
};

export type CreateQueryOptionsWithNonSerializableKey<Options, Deps extends ProviderDeps> = {
  key: (this: ReactQueryContext<Deps>, options: Options) => ReactQueryKeyOrString;

  actionNamePostfix: string;

  fn: Function;

  deps?: Deps;

  conditions?: ActionConditionsParameters;
};

export type BaseCreateQueryOptions<Options, Deps extends ProviderDeps> =
  | CreateQueryOptionsWithNonSerializableKey<Options, Deps>
  | CreateQueryOptionsWithSerializableKey<Options, Deps>;

export interface BaseQuery<Options, TCreateQuery, TQuery, TUseQuery> {
  [QUERY_PARAMETERS]: TCreateQuery;
  fork(options: TUseQuery): TQuery;
  raw(di: Container, options?: Options): TUseQuery;
  /**
   * @deprecated pass di as first parameter instead of context
   */
  raw(context: ActionContext, options?: Options): TUseQuery;

  prefetchAction(options?: Options): TramvaiAction<[], Promise<void>, any>;

  actionNamePostfix: string;
}

export const isQuery = <Options, Result, TCreateQuery, TQuery, TUseQuery>(
  arg: BaseQuery<Options, TCreateQuery, TQuery, TUseQuery> | QueryOptions<Result, any, any, any>
): arg is BaseQuery<Options, TCreateQuery, TQuery, TUseQuery> => {
  return QUERY_PARAMETERS in arg;
};
