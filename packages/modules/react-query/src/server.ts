import { commandLineListTokens, Module, provide } from '@tramvai/core';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import { commandLineListTokens as childAppCommandLineListTokens } from '@tramvai/tokens-child-app';
import { dehydrate as queryDehydrate } from '@tanstack/react-query';
import { safeStringify } from '@tramvai/safe-strings';
import {
  QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
  QUERY_CLIENT_TOKEN,
  QUERY_DEHYDRATE_STATE_NAME_TOKEN,
} from '@tramvai/tokens-react-query';
import { sharedQueryProviders } from './shared/providers';

export * from '@tramvai/tokens-react-query';

@Module({
  imports: [],
  providers: [
    ...sharedQueryProviders,
    provide({
      provide: QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
      useFactory: ({ queryClient }) => {
        return queryDehydrate(queryClient);
      },
      deps: {
        queryClient: QUERY_CLIENT_TOKEN,
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
      useFactory: ({ queryClient }) => {
        return function clearQueryClient() {
          return queryClient.clear();
        };
      },
      deps: {
        queryClient: QUERY_CLIENT_TOKEN,
      },
    }),
    // this module is used directly in child app, so we need to provide clear command for child app as well
    provide({
      provide: childAppCommandLineListTokens.clear,
      useFactory: ({ queryClient }) => {
        return function clearQueryClient() {
          return queryClient.clear();
        };
      },
      deps: {
        queryClient: QUERY_CLIENT_TOKEN,
      },
    }),
  ],
})
export class ReactQueryModule {}
