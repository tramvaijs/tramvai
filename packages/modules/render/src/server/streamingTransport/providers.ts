import { optional, provide } from '@tramvai/core';
import {
  CUSTOM_RENDER,
  REACT_SERVER_RENDER_MODE,
  RENDER_SLOTS,
  ResourceSlot,
  ResourceType,
  STREAMING_TRANSPORT_TOKEN,
} from '@tramvai/tokens-render';
import {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { createStreamingTransport, streamingRegistryInitScript } from './transport';

export const streamingTransportProviders = [
  provide({
    provide: STREAMING_TRANSPORT_TOKEN,
    useFactory: ({ renderMode, customRender, responseTaskManager, responseStream }) => {
      // transport relies on `ReactRenderServer` streaming render: it writes scripts after the shell
      // and rejects unsettled values on the response stream timeout
      if (
        !process.env.__TRAMVAI_CONCURRENT_FEATURES ||
        renderMode !== 'streaming' ||
        customRender ||
        !responseTaskManager ||
        !responseStream
      ) {
        return null;
      }

      return createStreamingTransport({ responseTaskManager, responseStream });
    },
    deps: {
      renderMode: optional(REACT_SERVER_RENDER_MODE),
      customRender: optional(CUSTOM_RENDER),
      responseTaskManager: optional(SERVER_RESPONSE_TASK_MANAGER),
      responseStream: optional(SERVER_RESPONSE_STREAM),
    },
  }),
  provide({
    provide: RENDER_SLOTS,
    multi: true,
    useFactory: ({ transport }) => {
      if (!transport) {
        return [];
      }

      return {
        type: ResourceType.inlineScript,
        slot: ResourceSlot.HEAD_CORE_SCRIPTS,
        payload: streamingRegistryInitScript,
      };
    },
    deps: {
      transport: STREAMING_TRANSPORT_TOKEN,
    },
  }),
];
