import { declareAction, createBundle } from '@tramvai/core';
import { createEvent, createReducer, useStoreSelector } from '@tramvai/state';

const updateState = createEvent<string>('bundle-reducer-test update');

const reducer = createReducer('bundle-reducer-test', {
  state: 'initial',
});

reducer.on(updateState, (state, newState) => {
  return {
    ...state,
    state: newState,
  };
});

const action = declareAction({
  name: 'bundle-reducer-test-update',
  fn() {
    const state = this.getState(reducer);

    return this.dispatch(updateState(`updated-from-${state?.state}`));
  },
});

export const PageDefault = () => {
  const reducerState = useStoreSelector(reducer, ({ state }) => state);

  return (
    <>
      <h2 id="test-reducer-state">{reducerState}</h2>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'bundle-reducer',
  actions: [action],
  reducers: [reducer],
  components: {
    pageDefault: PageDefault,
  },
});
