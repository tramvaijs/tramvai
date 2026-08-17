import { declareModule, provide } from '@tramvai/core';
import { workboxEnabled } from '@tramvai/cli/lib/external/pwa';

import { PWA_ACTIVE_CONFIG_TOKEN, PWA_SW_URL_TOKEN } from '../tokens';
import {
  providers as swProviders,
  sharedPwaLightModuleProviders,
} from './shared/providers/swProviders';
import {
  pwaWorkboxTokenProvider,
  workboxRegisterProvider,
} from './shared/providers/workboxProviders';

export const TramvaiPwaWorkboxModule = declareModule({
  name: 'TramvaiPwaWorkboxModule',
  providers: [
    ...swProviders,
    ...(workboxEnabled ? [workboxRegisterProvider] : []),
    pwaWorkboxTokenProvider,
    provide({
      provide: PWA_SW_URL_TOKEN,
      useFactory: ({ pwaActiveConfig }) => {
        return pwaActiveConfig?.sw?.url;
      },
      deps: {
        pwaActiveConfig: PWA_ACTIVE_CONFIG_TOKEN,
      },
    }),
  ],
});

export const TramvaiPwaLightWorkboxModule = declareModule({
  name: 'TramvaiPwaLightWorkboxModule',
  providers: [...sharedPwaLightModuleProviders, pwaWorkboxTokenProvider, workboxRegisterProvider],
});
