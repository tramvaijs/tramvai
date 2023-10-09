import { createReducer, createEvent } from '@tramvai/state';
import type { SerializableMetaWalkState } from '@tinkoff/meta-tags-generate';

export const setServerMetaWalkState = createEvent<SerializableMetaWalkState>(
  'set application metaWalk state'
);
export const metaStore = createReducer<{ serverMetaWalkState: SerializableMetaWalkState }>(
  'appMeta',
  {
    serverMetaWalkState: [],
  }
).on(setServerMetaWalkState, (state, serverMetaWalkState) => ({
  ...state,
  serverMetaWalkState,
}));
