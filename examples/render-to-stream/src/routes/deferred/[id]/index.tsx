import { useRoute } from '@tinkoff/router';
import { declareAction } from '@tramvai/core';
import { Await } from '@tramvai/module-common';
import type { PageComponent } from '@tramvai/react';
import { lazy } from '@tramvai/react';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { Suspense } from 'react';

const LazyTitle = lazy(() => import('../../../components/features/Title/Title'), {
  suspense: true,
});
const LazyData = lazy(() => import('../../../components/features/Data/Data'), { suspense: true });

const longDeferredIdAction = declareAction({
  name: 'longDeferredId',
  async fn() {
    const route = this.deps.pageService.getCurrentRoute();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: route.params.id };
  },
  deps: {
    pageService: PAGE_SERVICE_TOKEN,
  },
  conditions: {
    dynamic: true,
  },
  deferred: true,
});

export const DeferredPage: PageComponent = () => {
  // we need to manually subscribe to route params changes, to get always correct deferred promise
  // also we need to pass param used in action to Suspense key https://github.com/remix-run/remix/issues/6637#issuecomment-1598997565
  const { params } = useRoute();

  return (
    <>
      <LazyTitle>Deferred Id Page</LazyTitle>
      <Suspense key={params.id} fallback={<div>Loading long...</div>}>
        <Await action={longDeferredIdAction}>
          {(data) => {
            return <LazyData data={`Response: ${data.data}`} />;
          }}
        </Await>
      </Suspense>
    </>
  );
};

DeferredPage.actions = [longDeferredIdAction];

export default DeferredPage;
