import type { PageComponent } from '@tramvai/react';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, SuspenseQueryCard, UseQueryCard } from '../../../shared/components';

// without explicit retry: single attempt at server-side, then client fetch with default retries
const defaultRetryQuery = createDemoQuery(
  { name: 'errors-500-default-retry', delay: 1000, failStatus: 500 },
  { deferred: true }
);
// explicit retry is used both at server-side and client-side
const serverErrorQuery = createDemoQuery({ name: 'errors-500', delay: 1000, failStatus: 500 }, { retry: 1, deferred: true });
const notFoundQuery = createDemoQuery({ name: 'errors-404', delay: 1000, failStatus: 404 }, { retry: 1, deferred: true });
const suspenseErrorQuery = createDemoQuery({ name: 'errors-suspense-500', delay: 1000, failStatus: 500 }, { retry: 1, deferred: true });

const ErrorsPage: PageComponent = () => (
  <Scenario
    title="5. Errors in deferred queries"
    expected={
      <>
        server-side retries are disabled for streamed queries without explicit retry. Server error is
        redacted, and the client immediately fetches the query with the component options (no error
        state in between). Explicit retry (1) is used both at server-side and client-side
      </>
    }
  >
    <UseQueryCard title="errors-500-default-retry" query={defaultRetryQuery} />
    <UseQueryCard title="errors-500" query={serverErrorQuery} />
    <UseQueryCard title="errors-404" query={notFoundQuery} />
    <SuspenseQueryCard title="errors-suspense-500" query={suspenseErrorQuery} />
  </Scenario>
);

ErrorsPage.actions = [
  defaultRetryQuery.prefetchAction(),
  serverErrorQuery.prefetchAction(),
  notFoundQuery.prefetchAction(),
  suspenseErrorQuery.prefetchAction(),
];

export default ErrorsPage;
