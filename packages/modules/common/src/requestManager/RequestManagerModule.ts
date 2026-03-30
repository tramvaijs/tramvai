import { Module, commandLineListTokens, provide } from '@tramvai/core';
import { REQUEST_MANAGER_TOKEN, CONTEXT_TOKEN, ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { setRequest } from './RequestManagerStore';
import { sharedProviders } from './sharedProviders';

@Module({
  providers: [
    ...sharedProviders,
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ context, requestManager }) => {
        return function dehydrateRequestManager() {
          // do not send IP into browser for SSG, CSR and ISR
          const disableIpRehydration =
            requestManager.getHeader('x-tramvai-static-page-revalidate') ||
            requestManager.getHeader('x-tramvai-prerender');

          return context.dispatch(
            setRequest({
              body: requestManager.getBody(),
              headers: disableIpRehydration
                ? {}
                : {
                    'x-real-ip': requestManager.getClientIp(),
                  },
            })
          );
        };
      },
      deps: {
        context: CONTEXT_TOKEN,
        requestManager: REQUEST_MANAGER_TOKEN,
      },
    }),
  ],
})
export class RequestManagerModule {}
