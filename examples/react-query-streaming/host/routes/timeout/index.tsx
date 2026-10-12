import type { PageComponent } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, SuspenseQueryCard, UseQueryCard } from '../../../shared/components';

const inTimeQuery = createDemoQuery({ name: 'timeout-in-time', delay: 500 }, { deferred: true });
const tooSlowQuery = createDemoQuery({ name: 'timeout-too-slow', delay: 3000 }, { retry: 1, deferred: true });
const tooSlowSuspenseQuery = createDemoQuery({ name: 'timeout-too-slow-suspense', delay: 3000 }, { retry: 1, deferred: true });

const TimeoutPage: PageComponent = () => (
  <Scenario
    title="6. Response stream timeout"
    expected={
      <>
        with <Link url="/timeout/?streamingTimeout=1500">?streamingTimeout=1500</Link> slow queries
        are aborted on the server, and the client requests them itself (one client call each);
        the fast one still comes from the server. With default timeout (5000) everything comes from
        the server.
      </>
    }
  >
    <UseQueryCard title="timeout-in-time" query={inTimeQuery} />
    <UseQueryCard title="timeout-too-slow" query={tooSlowQuery} />
    <SuspenseQueryCard title="timeout-too-slow-suspense" query={tooSlowSuspenseQuery} />
  </Scenario>
);

TimeoutPage.actions = [
  inTimeQuery.prefetchAction(),
  tooSlowQuery.prefetchAction(),
  tooSlowSuspenseQuery.prefetchAction(),
];

export default TimeoutPage;
