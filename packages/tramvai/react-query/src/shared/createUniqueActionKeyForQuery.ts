import type { ProviderDeps } from '@tinkoff/dippy';
import type { BaseCreateQueryOptions, ReactQueryKeyOrString } from '../baseQuery/types';
import { normalizeKey } from './normalizeKey';

export const createUniqueActionKeyForQuery = <Options, Deps extends ProviderDeps>(
  queryParameters: BaseCreateQueryOptions<Options, Deps>
): string => {
  const rawQueryKey =
    typeof queryParameters.key === 'function'
      ? queryParameters.actionNamePostfix
      : queryParameters.actionNamePostfix ?? queryParameters.key;

  const queryKeyArray = normalizeKey(rawQueryKey as ReactQueryKeyOrString);

  return queryKeyArray.join('_');
};
