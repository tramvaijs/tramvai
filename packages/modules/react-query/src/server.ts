import { commandLineListTokens, Module, optional, provide } from '@tramvai/core';
import {
  RENDER_SLOTS,
  ResourceType,
  ResourceSlot,
  STREAMING_TRANSPORT_TOKEN,
} from '@tramvai/tokens-render';
import type { StreamingTransport } from '@tramvai/tokens-render';
import { commandLineListTokens as childAppCommandLineListTokens } from '@tramvai/tokens-child-app';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { dehydrate as queryDehydrate } from '@tanstack/react-query';
import { safeStringify } from '@tramvai/safe-strings';
import {
  QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
  QUERY_CLIENT_TOKEN,
  QUERY_DEHYDRATE_STATE_NAME_TOKEN,
  QUERY_STREAMING_ACTIVE_TOKEN,
  QUERY_STREAMING_ENABLED_TOKEN,
} from '@tramvai/tokens-react-query';
import { sharedQueryProviders } from './shared/providers';
import { dehydrateWithStreaming } from './server/streaming';

export * from '@tramvai/tokens-react-query';

/**
 * Queries are streamed only when the feature is enabled and the response is streamed
 */
const getActiveTransport = ({
  enabled,
  transport,
}: {
  enabled: boolean;
  transport: StreamingTransport | null;
}) => (enabled ? transport : null);

const streamingDeps = {
  enabled: QUERY_STREAMING_ENABLED_TOKEN,
  transport: optional(STREAMING_TRANSPORT_TOKEN),
};

const clearQueryClientProvider = {
  useFactory: ({ queryClient, ...deps }: any) => {
    return function clearQueryClient() {
      const transport = getActiveTransport(deps);

      if (!transport) {
        return queryClient.clear();
      }

      // clearing the client cancels in-flight queries, and suspended components can still read the cache
      // until React finishes rendering, so clear it only when the response stream is finished
      transport.onFinish(() => queryClient.clear());
    };
  },
  deps: {
    queryClient: QUERY_CLIENT_TOKEN,
    ...streamingDeps,
  },
};

@Module({
  imports: [],
  providers: [
    ...sharedQueryProviders,
    provide({
      provide: QUERY_STREAMING_ENABLED_TOKEN,
      useValue: false,
    }),
    provide({
      provide: QUERY_STREAMING_ACTIVE_TOKEN,
      useFactory: (deps) => !!getActiveTransport(deps),
      deps: streamingDeps,
    }),
    provide({
      provide: QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
      useFactory: ({ queryClient, propKey, logger, ...deps }) => {
        const transport = getActiveTransport(deps);

        if (!transport) {
          return queryDehydrate(queryClient);
        }

        return dehydrateWithStreaming({
          queryClient,
          propKey,
          transport,
          log: logger('react-query:streaming'),
        });
      },
      deps: {
        queryClient: QUERY_CLIENT_TOKEN,
        propKey: QUERY_DEHYDRATE_STATE_NAME_TOKEN,
        logger: LOGGER_TOKEN,
        ...streamingDeps,
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ state, propKey }) => {
        return {
          type: ResourceType.asIs,
          slot: ResourceSlot.BODY_END,
          payload: `<script id="${propKey}" type="application/json">${safeStringify(
            state
          )}</script>`,
        };
      },
      deps: {
        state: QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
        propKey: QUERY_DEHYDRATE_STATE_NAME_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.clear,
      multi: true,
      ...clearQueryClientProvider,
    }),
    // this module is used directly in child app, so we need to provide clear command for child app as well
    provide({
      provide: childAppCommandLineListTokens.clear,
      multi: true,
      ...clearQueryClientProvider,
    }),
  ],
})
export class ReactQueryModule {}
