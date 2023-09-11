import { createEvent, createReducer } from '@tramvai/state';
import type { AnyError, SerializedError } from '@tramvai/safe-strings';
import { serializeError, deserializeError } from '@tramvai/safe-strings';

export { serializeError, deserializeError, SerializedError };

export type IPageErrorStore = SerializedError | null;

export const setPageErrorEvent = createEvent<AnyError | null>('setPageError');

const initialState = null;

export const PageErrorStore = createReducer('pageError', initialState as IPageErrorStore).on(
  setPageErrorEvent,
  (state, error) => error && serializeError(error)
);
