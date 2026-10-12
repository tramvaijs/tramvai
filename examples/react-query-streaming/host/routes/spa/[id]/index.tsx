import type { PageComponent } from '@tramvai/react';
import { Link, PAGE_SERVICE_TOKEN, useRoute } from '@tramvai/module-router';
import { createQuery } from '@tramvai/react-query';
import { fakeRequest } from '../../../../shared/api';
import type { DemoQuery } from '../../../../shared/queries';
import { Scenario, SuspenseQueryCard, UseQueryCard } from '../../../../shared/components';

const createRouteQuery = (prefix: string): DemoQuery =>
  createQuery({
    actionNamePostfix: `spa-${prefix}`,
    key() {
      return ['spa', prefix, this.deps.pageService.getCurrentRoute().params.id];
    },
    fn() {
      const { id } = this.deps.pageService.getCurrentRoute().params;

      return fakeRequest({ name: `spa-${prefix}-${id}`, delay: 1500 });
    },
    deps: {
      pageService: PAGE_SERVICE_TOKEN,
    },
    conditions: {
      dynamic: true,
    },
    deferred: true,
  });

const useQueryByRoute = createRouteQuery('use-query');
const suspenseQueryByRoute = createRouteQuery('suspense');

const SpaPage: PageComponent = () => {
  // query options are memoized by `useQuery`, and key depends on the route,
  // so components have to be remounted on route change (same as for `Await` with deferred actions)
  const { params } = useRoute();

  return (
    <Scenario
      title="7. SPA navigation with dynamic route params"
      expected="first load: data from server, no client calls. SPA transitions: one client call per query (visited ids are refetched too, because staleTime is 0)"
    >
      <p>
        <Link url="/spa/1/">id 1</Link> · <Link url="/spa/2/">id 2</Link> ·{' '}
        <Link url="/spa/3/">id 3</Link>
      </p>
      <div key={params.id}>
        <UseQueryCard title="spa-use-query" query={useQueryByRoute} />
        <SuspenseQueryCard title="spa-suspense" query={suspenseQueryByRoute} />
      </div>
    </Scenario>
  );
};

SpaPage.actions = [
  useQueryByRoute.prefetchAction(),
  suspenseQueryByRoute.prefetchAction(),
];

export default SpaPage;
