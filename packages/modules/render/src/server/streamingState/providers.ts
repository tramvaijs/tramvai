import { commandLineListTokens, optional, provide } from '@tramvai/core';
import { ASYNC_LOCAL_STORAGE_TOKEN, LOGGER_TOKEN, STORE_MIDDLEWARE } from '@tramvai/tokens-common';
import {
  RESOURCES_REGISTRY,
  REACT_SERVER_RENDER_MODE,
  ResourceSlot,
  ResourceType,
  STORE_SYNC_EVENTS_SERIALIZE_TOKEN,
  STORE_SYNC_EVENTS_TOKEN,
} from '@tramvai/tokens-render';
import {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { safeStringify } from '@tramvai/safe-strings';
import { StoreSyncEventsMiddleware } from './StoreSyncEventsMiddleware';

export const streamedStateSyncProviders = [
  provide({
    provide: STORE_SYNC_EVENTS_SERIALIZE_TOKEN,
    useValue: (event) => safeStringify(event),
  }),
  provide({
    provide: STORE_SYNC_EVENTS_TOKEN,
    useFactory: ({ responseTaskManager, serverResponseStream, serialize, logger, storage }) => {
      return StoreSyncEventsMiddleware(
        responseTaskManager,
        serverResponseStream,
        serialize,
        logger,
        storage
      );
    },
    deps: {
      responseTaskManager: SERVER_RESPONSE_TASK_MANAGER,
      serverResponseStream: SERVER_RESPONSE_STREAM,
      serialize: STORE_SYNC_EVENTS_SERIALIZE_TOKEN,
      logger: LOGGER_TOKEN,
      storage: optional(ASYNC_LOCAL_STORAGE_TOKEN),
    },
  }),
  provide({
    provide: STORE_MIDDLEWARE,
    multi: true,
    useFactory: ({ middleware }) => middleware,
    deps: {
      middleware: STORE_SYNC_EVENTS_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.generatePage,
    useFactory: ({ resourcesRegistry, renderMode }) => {
      return async function initStreamedEventsQueue() {
        if (renderMode !== 'streaming') {
          return;
        }

        resourcesRegistry.register({
          slot: ResourceSlot.HEAD_CORE_SCRIPTS,
          type: ResourceType.inlineScript,
          payload:
            'window.__TRAMVAI_STREAMED_EVENTS = { queue: [], push: function (event) { this.queue.push(event); } };',
        });
      };
    },
    deps: {
      resourcesRegistry: RESOURCES_REGISTRY,
      renderMode: optional(REACT_SERVER_RENDER_MODE),
    },
  }),
];
