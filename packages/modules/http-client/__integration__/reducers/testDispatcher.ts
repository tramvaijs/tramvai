import { createEvent, createReducer } from '@tramvai/state';

export const updateTestDispatcherState = createEvent<string>('updateTestDispatcherState');

export const testDispatcherReducer = createReducer('testDispatcher', [] as string[]).on(
  updateTestDispatcherState,
  (state, payload) => [...state, payload]
);
