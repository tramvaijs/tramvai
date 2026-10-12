import type { PageComponent } from '@tramvai/react';

const OverviewPage: PageComponent = () => (
  <>
    <h2>Overview</h2>
    <p>
      Playground for streaming react-query data from the server to the client with deferred
      actions. Every scenario prints where the data came from (<b>server</b> or <b>client</b>),
      when it was shown, and all client-side API calls at the bottom of the page.
    </p>
    <p>
      Deferred queries are created with <code>createQuery(&#123; deferred: true &#125;)</code> and
      prefetched with a regular <code>prefetchAction()</code>.
    </p>
    <p>
      How to read the result: a query started on the server must have <b>no</b> entry in the client
      calls log and must show <code>data from server</code>.
    </p>
  </>
);

export default OverviewPage;
