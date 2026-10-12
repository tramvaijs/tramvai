import type { PageComponent } from '@tramvai/react';
import { createDemoInfiniteQuery } from '../../../shared/queries';
import { Scenario } from '../../../shared/components';
import { InfiniteQueryCard, SuspenseInfiniteQueryCard } from '../../../shared/infiniteComponents';

const deferredInfiniteQuery = createDemoInfiniteQuery(
  { name: 'infinite-deferred', delay: 1500 },
  { deferred: true }
);
const suspenseInfiniteQuery = createDemoInfiniteQuery({ name: 'infinite-no-prefetch', delay: 1000 });

const InfinitePage: PageComponent = () => (
  <Scenario
    title="11. Infinite queries"
    expected="first page from server for both (deferred prefetch and suspense query without prefetch, started during render), no client calls. &quot;load more&quot; fetches next pages on the client and appends them to the same list"
  >
    <InfiniteQueryCard title="infinite-deferred" query={deferredInfiniteQuery} />
    <SuspenseInfiniteQueryCard title="infinite-no-prefetch" query={suspenseInfiniteQuery} />
  </Scenario>
);

InfinitePage.actions = [deferredInfiniteQuery.prefetchAction()];

export default InfinitePage;
