import type { ProviderDeps } from '@tinkoff/dippy';
import type {
  BaseCreateQueryOptions,
  CreateQueryOptionsWithSerializableKey,
  ReactQueryKeyOrString,
} from '../baseQuery/types';
import { normalizeKey } from './normalizeKey';

function isSerializableKey<Options, Deps extends ProviderDeps>(
  options: BaseCreateQueryOptions<Options, Deps>
): options is CreateQueryOptionsWithSerializableKey<Options, Deps> {
  return !('actionNamePostfix' in options);
}
export const createUniqueActionKeyForQuery = <Options, Deps extends ProviderDeps>(
  queryParameters: BaseCreateQueryOptions<Options, Deps>
): string => {
  const rawQueryKey = isSerializableKey(queryParameters)
    ? (queryParameters.actionNamePostfix ?? queryParameters.key)
    : queryParameters.actionNamePostfix;

  const queryKeyArray = normalizeKey(rawQueryKey as ReactQueryKeyOrString);

  return queryKeyArray.join('_');
};
