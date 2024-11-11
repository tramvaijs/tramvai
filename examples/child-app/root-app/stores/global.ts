import { createEvent, createReducer } from '@tramvai/state';

interface State {
  value: string;
}

export const setGlobalStoreValue = createEvent<string>('setGlobalStoreValue');

export const globalStore = createReducer('global', { value: 'global' } as State).on(
  setGlobalStoreValue,
  (_, value) => {
    return {
      value,
    };
  }
);
