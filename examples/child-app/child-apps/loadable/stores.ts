import { createReducer, createEvent } from '@tramvai/state';

export const updateTestEvent = createEvent<string>('child-test update');

type State = string[];

export const testStore = createReducer({
  name: 'child-loadable-actions',
  initialState: [] as State,
  events: {
    logAction: (state, value) => [...state, value],
  },
});
