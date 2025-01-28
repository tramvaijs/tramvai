import { useDi } from '@tramvai/react';
import { Deferred } from '@tramvai/core';
import { DEFERRED_ACTIONS_MAP_TOKEN } from '@tramvai/tokens-common';
import type { TramvaiAction } from '@tramvai/types-actions-state-context';
import { deserializeError } from '@tramvai/safe-strings';

export function Await<Result>({
  action,
  children,
  error,
}: {
  action: TramvaiAction<any, Result, any>;
  children: (data: Result extends Promise<infer R> ? R : Result) => JSX.Element;
  error?: (reason: any) => JSX.Element;
}) {
  const deferredMap = useDi(DEFERRED_ACTIONS_MAP_TOKEN);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let deferred = deferredMap.get(action.name)!;

  if (!action.deferred) {
    throw new Error(`Action ${action.name} is not deferred`);
  }

  // will be created when spa run actions mode is "after"
  if (!deferred) {
    deferred = new Deferred();
    // avoid unhandled promise rejection
    deferred.promise.catch(() => {});
    deferredMap.set(action.name, deferred);
  }

  if (deferred.isResolved()) {
    return children(deferred.resolveData);
  }

  if (deferred.isRejected()) {
    const reason =
      deferred.rejectReason instanceof Error
        ? deferred.rejectReason
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          deserializeError(deferred.rejectReason!);

    if (!error) {
      throw reason;
    }
    return error(reason);
  }

  throw deferred.promise;
}
