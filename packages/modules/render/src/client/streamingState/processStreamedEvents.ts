import type { STORE_TOKEN, DISPATCHER_TOKEN } from '@tramvai/tokens-common';
import type { StoreSyncEvent } from '@tramvai/tokens-render';

interface StreamedEventsQueue {
  queue: Array<StoreSyncEvent>;
  push: (event: StoreSyncEvent) => void;
}

interface Deps {
  store: typeof STORE_TOKEN;
  dispatcher: typeof DISPATCHER_TOKEN;
}

export const processStreamedEvents = ({ store, dispatcher }: Deps) => {
  const streamedEvents: StreamedEventsQueue = (window as any).__TRAMVAI_STREAMED_EVENTS;

  const dispatchStreamedEvent = (event: StoreSyncEvent) => {
    try {
      store.dispatch({
        type: event.type,
        payload: event.payload,
        store: event.store ? (dispatcher.stores[event.store] ?? null) : null,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`Failed to dispatch streamed event "${event.type}":`, error);
      }
    }
  };

  streamedEvents.queue.forEach(dispatchStreamedEvent);

  streamedEvents.queue = [];
  streamedEvents.push = dispatchStreamedEvent;
};
