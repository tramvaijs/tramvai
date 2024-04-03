import { useCallback } from 'react';
import type { PageComponent } from '@tramvai/react';
import { createAction, createBundle } from '@tramvai/core';
import { ChildApp } from '@tramvai/module-child-app';
import { useConsumerContext, useStore } from '@tramvai/state';
import { createEvent, createReducer } from '@tramvai/state';

interface State {
  value: number;
}

export const increaseValue = createEvent<void>('increaseValue');

export const rootStore = createReducer('root', { value: 0 } as State).on(increaseValue, (state) => {
  return {
    value: state.value + 1,
  };
});

export const increaseAnotherValue = createEvent<void>('increaseAnotherValue');

export const anotherRootStore = createReducer('another root', { value: 0 } as State).on(
  increaseAnotherValue,
  (state) => {
    return {
      value: state.value + 1,
    };
  }
);

export const updateRootValueAction = createAction({
  name: 'root-app-store',
  fn(context) {
    return context.dispatch(increaseValue());
  },
  conditions: {
    onlyServer: true,
  },
});

export const updateAnotherRootValueAction = createAction({
  name: 'another-root-app-store',
  fn(context) {
    return context.dispatch(increaseAnotherValue());
  },
  conditions: {
    onlyServer: true,
  },
});

const Cmp: PageComponent = () => {
  const context = useConsumerContext();
  const state = useStore(rootStore);
  const anotherState = useStore(anotherRootStore);

  const update = useCallback(() => {
    context.dispatch(increaseValue());
  }, [context]);
  const anotherUpdate = useCallback(() => {
    context.dispatch(increaseAnotherValue());
  }, [context]);

  return (
    <>
      <h2>Root</h2>
      <div>
        Content from root, state: {state.value} | {anotherState.value}
      </div>
      <button id="button" type="button" onClick={update}>
        Update Root State
      </button>
      <button id="button-another" type="button" onClick={anotherUpdate}>
        Update Another Root State
      </button>
      <h3>Child</h3>
      <ChildApp name="state" />
    </>
  );
};

Cmp.childApps = [{ name: 'state' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'state',
  components: {
    pageDefault: Cmp,
  },
  reducers: [rootStore, anotherRootStore],
  actions: [updateRootValueAction, updateAnotherRootValueAction],
});
