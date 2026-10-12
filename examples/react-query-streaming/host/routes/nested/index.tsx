import type { PageComponent } from '@tramvai/react';
import { CONTEXT_TOKEN } from '@tramvai/tokens-common';
import { createQuery } from '@tramvai/react-query';
import { fakeRequest } from '../../../shared/api';
import type { DemoQuery } from '../../../shared/queries';
import { createDemoQuery } from '../../../shared/queries';
import { Scenario, UseQueryCard } from '../../../shared/components';

const earlyChildQuery = createDemoQuery({ name: 'nested-early-child', delay: 1500 });
const lateChildQuery = createDemoQuery({ name: 'nested-late-child', delay: 1000 });

/**
 * Child query is started immediately, so it is already pending at dehydration time
 */
const earlyParentQuery: DemoQuery = createQuery({
  key: ['nested-early-parent'],
  async fn() {
    const [parent] = await Promise.all([
      fakeRequest({ name: 'nested-early-parent', delay: 500 }),
      this.deps.context.executeAction(earlyChildQuery.fetchAction()),
    ]);

    return parent;
  },
  deps: {
    context: CONTEXT_TOKEN,
  },
  deferred: true,
});

/**
 * Child query is started after `await`, when the shell is already rendered and dehydrated
 */
const lateParentQuery: DemoQuery = createQuery({
  key: ['nested-late-parent'],
  async fn() {
    const parent = await fakeRequest({ name: 'nested-late-parent', delay: 500 });

    await this.deps.context.executeAction(lateChildQuery.fetchAction());

    return parent;
  },
  deps: {
    context: CONTEXT_TOKEN,
  },
  deferred: true,
});

const NestedPage: PageComponent = () => (
  <Scenario
    title="9. Nested queries (fetchAction inside a deferred query)"
    expected={
      <>
        early child: from server, no client calls. Late child: with the base transport only it is
        requested again on the client (known gap); after &quot;late queries sync&quot; phase it
        comes from the server as well
      </>
    }
  >
    <UseQueryCard title="nested-early-parent" query={earlyParentQuery} />
    <UseQueryCard title="nested-early-child" query={earlyChildQuery} />
    <UseQueryCard title="nested-late-parent" query={lateParentQuery} />
    <UseQueryCard title="nested-late-child" query={lateChildQuery} />
  </Scenario>
);

NestedPage.actions = [
  earlyParentQuery.prefetchAction(),
  lateParentQuery.prefetchAction(),
];

export default NestedPage;
