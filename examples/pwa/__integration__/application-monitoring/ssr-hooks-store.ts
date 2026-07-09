import { createEvent, createReducer } from '@tramvai/state';

export const addSsrHookEvent = createEvent<string>('addSsrHookEvent');

export const ssrHooksStore = createReducer('ssrHooksStore', {
  events: [] as string[],
}).on(addSsrHookEvent, (state, payload) => {
  return {
    events: [...state.events, payload],
  };
});
