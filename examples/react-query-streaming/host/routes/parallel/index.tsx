import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, SuspenseQueryCard, UseQueryCard } from '../../../shared/components';

const fastQuery = createDemoQuery({ name: 'parallel-fast', delay: 500 }, { deferred: true });
const mediumQuery = createDemoQuery({ name: 'parallel-medium', delay: 1500 }, { deferred: true });
const slowQuery = createDemoQuery({ name: 'parallel-slow', delay: 3000 }, { deferred: true });
const alreadyResolvedQuery = createDemoQuery({ name: 'parallel-instant', delay: 0 }, { deferred: true });

const ParallelPage: PageComponent = () => (
  <Scenario
    title="4. Parallel deferred queries"
    expected="each block is revealed independently in order of its delay; instant query is already resolved at dehydration and goes with the shell; no client calls"
  >
    <SuspenseQueryCard title="parallel-slow" query={slowQuery} />
    <SuspenseQueryCard title="parallel-fast" query={fastQuery} />
    <UseQueryCard title="parallel-medium" query={mediumQuery} />
    <SuspenseQueryCard title="parallel-instant" query={alreadyResolvedQuery} />
  </Scenario>
);

ParallelPage.actions = [
  slowQuery.prefetchAction(),
  fastQuery.prefetchAction(),
  mediumQuery.prefetchAction(),
  alreadyResolvedQuery.prefetchAction(),
];

export default ParallelPage;
