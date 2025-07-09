import { createReducer, createEvent } from '@tramvai/state';
import type { ChildAppRequestConfig } from '@tramvai/tokens-child-app';

type ChildAppPreloadStatusOnClient = Record<string, { status: 'loaded' | 'error' }>;

export const setPreloaded = createEvent<ChildAppRequestConfig[]>('child-app set preloaded');
export const setChildAppPreloadStatusOnClient = createEvent<ChildAppPreloadStatusOnClient>(
  'set child-app preload status on client'
);

const initialState: {
  preloaded: ChildAppRequestConfig[];
  childAppPreloadStatusOnClient: ChildAppPreloadStatusOnClient;
} = {
  preloaded: [],
  childAppPreloadStatusOnClient: {},
};

export const ChildAppStore = createReducer('child-app', initialState)
  .on(setPreloaded, (prev, preloaded) => {
    return {
      ...prev,
      preloaded,
    };
  })
  .on(setChildAppPreloadStatusOnClient, (prev, payload) => {
    return {
      ...prev,
      childAppPreloadStatusOnClient: {
        ...prev.childAppPreloadStatusOnClient,
        ...payload,
      },
    };
  });
