import { SuspenseQueryCard, UseQueryCard } from '../shared/components';
import {
  childBlockingQuery,
  childDeferredQuery,
  childSharedKeyQuery,
  childSuspenseQuery,
} from './queries';

export const ChildCmp = () => (
  <div data-testid="rq-streaming-child" style={{ borderLeft: '4px solid #8ab', paddingLeft: 8 }}>
    <UseQueryCard title="child-blocking" query={childBlockingQuery} />
    <UseQueryCard title="child-deferred-use-query" query={childDeferredQuery} />
    <SuspenseQueryCard title="child-deferred-suspense" query={childSuspenseQuery} />
    <UseQueryCard title="child-shared-key" query={childSharedKeyQuery} />
  </div>
);
