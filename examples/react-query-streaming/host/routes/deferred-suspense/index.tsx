import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, SuspenseQueryCard } from '../../../shared/components';

const slowQuery = createDemoQuery({ name: 'deferred-suspense', delay: 2000 }, { deferred: true });

const DeferredSuspensePage: PageComponent = () => (
  <Scenario
    title="3. Deferred prefetch + useSuspenseQuery"
    expected="instant first byte with suspense fallback, ready HTML of the boundary arrives with the stream (visible before JS is loaded), no client calls"
  >
    <SuspenseQueryCard title="deferred-suspense" query={slowQuery} />
  </Scenario>
);

DeferredSuspensePage.actions = [slowQuery.prefetchAction()];

export default DeferredSuspensePage;
