import { createEvent, createReducer } from '@tramvai/state';

export const addTapableHookEvent = createEvent<string>('addTapableHookEvent');

export const tapableHooksEventsStore = createReducer('tapableHooksEventsStore', {
  events: [],
} as { events: string[] }).on(addTapableHookEvent, (state, payload) => {
  return {
    events: [...state.events, payload],
  };
});
