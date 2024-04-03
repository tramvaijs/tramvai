import { declareAction } from '@tramvai/core';
import type { PageComponent } from '@tramvai/react';
import { lazy } from '@tramvai/react';
import { createReducer, useStore } from '@tramvai/state';

const LazyData = lazy(() => import('../../components/features/Data/Data'));

const initialState = null as { data: string } | null;

const testStore = createReducer({
  name: 'test',
  initialState,
  events: {
    loaded: (_, payload: { data: string }) => payload,
  },
});

const longAction = declareAction({
  name: 'long',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dispatch(testStore.events.loaded({ data: 'ok' }));
  },
});

export const NonDeferredPage: PageComponent = () => {
  const data = useStore(testStore);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <LazyData data={`Response: ${data.data}`} />
    </>
  );
};

NonDeferredPage.reducers = [testStore];
NonDeferredPage.actions = [longAction];

export default NonDeferredPage;
