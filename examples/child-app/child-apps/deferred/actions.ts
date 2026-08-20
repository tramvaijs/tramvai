import { declareAction } from '@tramvai/core';

export const deferredChildAction = declareAction({
  name: 'deferredChildAction',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      data: 'payload from deferredChildAction',
      env: typeof window === 'undefined' ? 'server' : 'client',
    };
  },
  deferred: true,
  conditions: {
    dynamic: true,
  },
});
