import { Module, optional, provide } from '@tramvai/core';
import { STREAMING_TRANSPORT_REGISTRY_TOKEN } from '@tramvai/tokens-render';
import {
  QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
  QUERY_CLIENT_TOKEN,
  QUERY_DEHYDRATE_STATE_NAME_TOKEN,
  QUERY_STREAMING_ACTIVE_TOKEN,
} from '@tramvai/tokens-react-query';
import { sharedQueryProviders } from './shared/providers';
import { hydrateStreamedQueries, subscribeToLateQueries } from './shared/streaming';

export * from '@tramvai/tokens-react-query';

@Module({
  imports: [],
  providers: [
    ...sharedQueryProviders,
    // streaming is a server-side only feature
    provide({
      provide: QUERY_STREAMING_ACTIVE_TOKEN,
      useValue: false,
    }),
    provide({
      provide: QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
      useFactory: ({ propKey, queryClient, registry }) => {
        const state = JSON.parse(document.getElementById(propKey)?.textContent ?? '{}');

        if (registry) {
          subscribeToLateQueries(queryClient, propKey, registry);
        }

        return hydrateStreamedQueries(state, propKey, queryClient, registry);
      },
      deps: {
        propKey: QUERY_DEHYDRATE_STATE_NAME_TOKEN,
        queryClient: QUERY_CLIENT_TOKEN,
        registry: optional(STREAMING_TRANSPORT_REGISTRY_TOKEN),
      },
    }),
  ],
})
export class ReactQueryModule {}
