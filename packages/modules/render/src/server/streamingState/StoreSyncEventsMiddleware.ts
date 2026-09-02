import type { Duplex } from 'stream';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { Middleware } from '@tramvai/state';
import type { LOGGER_TOKEN, ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import type { StoreSyncEvent, STORE_SYNC_EVENTS_SERIALIZE_TOKEN } from '@tramvai/tokens-render';
import type { SERVER_RESPONSE_TASK_MANAGER } from '@tramvai/tokens-server-private';

declare module '@tramvai/tokens-common' {
  interface AsyncLocalStorageState {
    isDeferredExecution?: boolean;
  }
}

export const StoreSyncEventsMiddleware = (
  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER,
  serverResponseStream: Duplex,
  serialize: typeof STORE_SYNC_EVENTS_SERIALIZE_TOKEN,
  logger: ExtractDependencyType<typeof LOGGER_TOKEN>,
  storage: typeof ASYNC_LOCAL_STORAGE_TOKEN | null
): Middleware & { startStreaming: () => void } => {
  const log = logger('state.streaming-sync');

  let streamingStarted = false;
  const middleware = () => (next) => (event) => {
    const result = next(event);

    if (streamingStarted && storage?.getStore()?.isDeferredExecution) {
      const storeSyncEvent: StoreSyncEvent = {
        type: event.type,
        payload: event.payload,
        store: event.store?.storeName ?? null,
      };

      responseTaskManager.push(async () => {
        let serialized: string;

        try {
          serialized = serialize(storeSyncEvent);
        } catch (error) {
          log.warn({
            event: 'streamed-state-sync:non-serializable-payload',
            message: `Event "${event.type}" has non-serializable payload and will not be streamed`,
            error,
          });

          return;
        }

        serverResponseStream.push(
          `<script>window.__TRAMVAI_STREAMED_EVENTS.push(${serialized});</script>`
        );
      });
    }

    return result;
  };

  middleware.startStreaming = () => {
    streamingStarted = true;
  };

  return middleware;
};
