import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, SuspenseQueryCard, UseQueryCard } from '../../../shared/components';

const useQueryWithoutPrefetch = createDemoQuery({ name: 'no-prefetch-use-query', delay: 1000 });
const suspenseQueryWithoutPrefetch = createDemoQuery({
  name: 'no-prefetch-suspense',
  delay: 1000,
});

/**
 * Hooks without `prefetchAction`: the query is not in the cache when page actions are finished
 */
const NoPrefetchPage: PageComponent = () => (
  <Scenario
    title="10. Hooks without prefetchAction"
    expected={
      <>
        useQuery: never fetched at server-side, loader in HTML, one client call.
        useSuspenseQuery: fetched during server render (after dehydration), so the client has no
        data and fetches it again
      </>
    }
  >
    <UseQueryCard title="no-prefetch-use-query" query={useQueryWithoutPrefetch} />
    <SuspenseQueryCard title="no-prefetch-suspense" query={suspenseQueryWithoutPrefetch} />
  </Scenario>
);

export default NoPrefetchPage;
