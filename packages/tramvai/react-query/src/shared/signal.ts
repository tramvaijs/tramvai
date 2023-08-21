import type { TramvaiActionContext } from '@tramvai/core';

// Support query cancellation - https://tanstack.com/query/v4/docs/react/guides/query-cancellation
export const mapQuerySignalToxecutionContext = (
  queryContext: { signal?: AbortSignal } = {},
  actionContext: TramvaiActionContext<any>
) => {
  if (queryContext.signal) {
    if (queryContext.signal.aborted) {
      actionContext.abortController.abort();
    } else {
      // abort action context AbortController if react-query AbortController was aborted
      queryContext.signal.addEventListener('abort', () => {
        actionContext.abortController.abort();
      });
    }
  }
};
