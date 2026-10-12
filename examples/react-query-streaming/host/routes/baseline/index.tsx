import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, UseQueryCard } from '../../../shared/components';

const blockingQuery = createDemoQuery({ name: 'baseline-blocking', delay: 300 });

/**
 * Current behaviour for comparison: page response waits for the query
 */
const BaselinePage: PageComponent = () => (
  <Scenario
    title="1. Baseline: blocking prefetchAction"
    expected="first byte after ~300ms (page actions deadline is 500ms), data from server, no client calls (unchanged)"
  >
    <UseQueryCard title="baseline-blocking" query={blockingQuery} />
  </Scenario>
);

BaselinePage.actions = [blockingQuery.prefetchAction()];

export default BaselinePage;
