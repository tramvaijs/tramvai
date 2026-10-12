import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, UseQueryCard } from '../../../shared/components';

const slowQuery = createDemoQuery({ name: 'deferred-use-query', delay: 2000 }, { deferred: true });

const DeferredUseQueryPage: PageComponent = () => (
  <Scenario
    title="2. Deferred prefetch + useQuery (no Suspense)"
    expected="instant first byte with loader, data from server arrives with the stream, no client calls"
  >
    <UseQueryCard title="deferred-use-query" query={slowQuery} />
  </Scenario>
);

DeferredUseQueryPage.actions = [slowQuery.prefetchAction()];

export default DeferredUseQueryPage;
