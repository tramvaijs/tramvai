import type { PageComponent } from '@tramvai/react';
import { ChildApp } from '@tramvai/module-child-app';
import { sharedKeyQuery } from '../../../shared/sharedKeyQuery';
import { Scenario, UseQueryCard } from '../../../shared/components';

const hostQuery = sharedKeyQuery('host');

const ChildAppPage: PageComponent = () => (
  <Scenario
    title="8. Child app"
    expected="child app scenarios behave the same as host ones; host and child query with the same key live in different QueryClients and both come from the server without collisions"
  >
    <h3>Host</h3>
    <UseQueryCard title="host-shared-key" query={hostQuery} />

    <h3>Child app</h3>
    <ChildApp name="rq-streaming-child" />
  </Scenario>
);

ChildAppPage.childApps = [{ name: 'rq-streaming-child' }];
ChildAppPage.actions = [hostQuery.prefetchAction()];

export default ChildAppPage;
