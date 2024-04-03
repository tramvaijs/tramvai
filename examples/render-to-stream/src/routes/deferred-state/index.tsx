import { declareAction } from '@tramvai/core';
import { DEFERRED_ACTIONS_MAP_TOKEN } from '@tramvai/module-common';
import type { PageComponent } from '@tramvai/react';
import { createReducer, useStore } from '@tramvai/state';

const deferredAction = declareAction({
  name: 'deferred',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: 'ok' };
  },
  deferred: true,
});

const initialState: {
  status: 'pending' | 'success';
  payload?: any;
} = {
  status: 'pending',
};

const deferredState = createReducer({
  name: 'deferredState',
  initialState,
  events: {
    success: (state, payload) => ({ status: 'success', payload }),
  },
});

const deferredClientStateAction = declareAction({
  name: 'deferredClientState',
  async fn() {
    const deferred = this.deps.deferredActionsMap.get(deferredAction.name);

    await deferred!.promise;

    this.dispatch(deferredState.events.success(deferred!.resolveData));
  },
  deps: {
    deferredActionsMap: DEFERRED_ACTIONS_MAP_TOKEN,
  },
  conditions: {
    onlyBrowser: true,
  },
});

export const DeferredStatePage: PageComponent = () => {
  const state = useStore(deferredState);

  return (
    <>
      <h1>Deferred State Page</h1>
      {state.status === 'pending' ? (
        <div>Loading...</div>
      ) : (
        <div>{`Response: ${state.payload.data}`}</div>
      )}
    </>
  );
};

DeferredStatePage.reducers = [deferredState];

DeferredStatePage.actions = [deferredAction, deferredClientStateAction];

export default DeferredStatePage;
