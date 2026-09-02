import { Suspense } from 'react';
import { declareAction } from '@tramvai/core';
import type { PageComponent } from '@tramvai/react';
import { Await } from '@tramvai/module-common';
import { createReducer, useStore } from '@tramvai/state';

type State = { name: string; status: 'pending' | 'success'; value?: string };

type InitialState = {
  fastDeferred: State;
  deferred: State;
  longDeferred: State;
  multiDeferred: State;
  nestedDeferred: State;
  normal: State;
};

const initialState: InitialState = {
  fastDeferred: { name: 'fastDeferred', status: 'pending' },
  deferred: { name: 'deferred', status: 'pending' },
  longDeferred: { name: 'longDeferred', status: 'pending' },
  multiDeferred: { name: 'multiDeferred', status: 'pending' },
  nestedDeferred: { name: 'nestedDeferred', status: 'pending' },
  normal: { name: 'normal', status: 'pending' },
};

const deferredSyncState = createReducer({
  name: 'deferredSyncState',
  initialState,
  events: {
    ...Object.keys(initialState).reduce(
      (acc, key) => {
        acc[`${key}Resolve`] = (state: InitialState, payload: { data: string }) => ({
          ...state,
          [key]: {
            ...state[key as keyof InitialState],
            status: 'success',
            value: payload.data,
          },
        });
        return acc;
      },
      {} as Record<string, (state: InitialState, payload: { data: string }) => InitialState>
    ),
  },
});

const fastDeferredStateAction = declareAction({
  name: 'fastDeferredSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.dispatch(
      deferredSyncState.events.fastDeferredResolve({ data: 'fast deferred action result' })
    );
  },
  deferred: true,
});

const longDeferredStateAction = declareAction({
  name: 'longDeferredSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.dispatch(
      deferredSyncState.events.longDeferredResolve({ data: 'long deferred action result' })
    );
  },
  deferred: true,
});

const multiDeferredStateAction = declareAction({
  name: 'multiDeferredSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dispatch(
      deferredSyncState.events.multiDeferredResolve({ data: 'multi deferred action result 1' })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dispatch(
      deferredSyncState.events.multiDeferredResolve({ data: 'multi deferred action result 2' })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dispatch(
      deferredSyncState.events.multiDeferredResolve({ data: 'multi deferred action result 3' })
    );
  },
  deferred: true,
});

const deferredStateAction = declareAction({
  name: 'deferredSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 550));

    this.dispatch(deferredSyncState.events.deferredResolve({ data: 'deferred action result' }));
  },
  deferred: true,
});

const normalStateAction = declareAction({
  name: 'normalSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 400));

    this.dispatch(deferredSyncState.events.normalResolve({ data: 'normal action result' }));
  },
});

const longNormalStateAction = declareAction({
  name: 'longNormalSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.dispatch(deferredSyncState.events.normalResolve({ data: 'long normal action result' }));
  },
  conditions: {
    onlyServer: true,
  },
});

const nestedNormalStateAction = declareAction({
  name: 'nestedNormalSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.dispatch(
      deferredSyncState.events.nestedDeferredResolve({
        data: 'nested deferred action result (child)',
      })
    );
  },
});

const rootDeferredStateAction = declareAction({
  name: 'rootDeferredSyncState',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dispatch(
      deferredSyncState.events.nestedDeferredResolve({
        data: 'nested deferred action result (root)',
      })
    );

    await this.executeAction(nestedNormalStateAction);
  },
  deferred: true,
});

const StateView = ({ name }: { name: keyof InitialState }) => {
  const state = useStore(deferredSyncState)[name];

  return (
    <div data-testid={state.name}>
      <h2>{state.name}</h2>
      {state.status === 'pending' ? <div>Loading...</div> : <div>{`Response: ${state.value}`}</div>}
    </div>
  );
};

const DataComponent = () => {
  const { multiDeferred } = useStore(deferredSyncState);

  return <div>{`Response: ${multiDeferred.value}`}</div>;
};

const StateWithSuspense = () => {
  return (
    <div data-testid="with-suspense">
      <h2>Multi Deferred Action (с Suspense)</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await action={multiDeferredStateAction}>{() => <DataComponent />}</Await>
      </Suspense>
    </div>
  );
};

export const DeferredStateSyncPage: PageComponent = () => {
  return (
    <>
      <h1>Deferred State Sync</h1>
      <StateView name="normal" />
      <StateView name="deferred" />
      <StateView name="fastDeferred" />
      <StateView name="longDeferred" />
      <StateView name="multiDeferred" />
      <StateView name="nestedDeferred" />
      <StateWithSuspense />
    </>
  );
};

DeferredStateSyncPage.reducers = [deferredSyncState];

DeferredStateSyncPage.actions = [
  deferredStateAction,
  normalStateAction,
  fastDeferredStateAction,
  longDeferredStateAction,
  longNormalStateAction,
  multiDeferredStateAction,
  rootDeferredStateAction,
];

export default DeferredStateSyncPage;
