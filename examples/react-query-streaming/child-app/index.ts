import { provide } from '@tramvai/core';
import { createChildApp } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { ReactQueryModule, QUERY_STREAMING_ENABLED_TOKEN } from '@tramvai/module-react-query';
import { ChildCmp } from './component';
import {
  childBlockingQuery,
  childDeferredQuery,
  childSharedKeyQuery,
  childSuspenseQuery,
} from './queries';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'rq-streaming-child',
  render: ChildCmp,
  modules: [CommonChildAppModule, ReactQueryModule],
  providers: [
    provide({
      provide: QUERY_STREAMING_ENABLED_TOKEN,
      useValue: true,
    }),
  ],
  actions: [
    childBlockingQuery.prefetchAction(),
    childDeferredQuery.prefetchAction(),
    childSuspenseQuery.prefetchAction(),
    childSharedKeyQuery.prefetchAction(),
  ],
});
