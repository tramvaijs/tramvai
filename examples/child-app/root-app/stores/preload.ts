import { createEvent, createReducer } from '@tramvai/state';

export const setFailedToPreloadChildApp = createEvent<string>('setFailedToPreloadChildApp');
export const setPreloadedChildApp = createEvent<string>('setPreloadedChildApp');

export const preloadedChildAppInfoStore = createReducer('preloadedChildAppInfo', {
  failedToLoad: [],
  preloaded: [],
} as { failedToLoad: string[]; preloaded: string[] })
  .on(setPreloadedChildApp, (prev, value) => {
    return {
      ...prev,
      preloaded: [...prev.preloaded, value],
    };
  })
  .on(setFailedToPreloadChildApp, (prev, value) => {
    return {
      ...prev,
      failedToLoad: [...prev.failedToLoad, value],
    };
  });
