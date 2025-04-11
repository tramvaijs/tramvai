import { declareModule, optional, provide } from '@tramvai/core';
import { PWA_SW_PARAMS_TOKEN, PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN } from '../tokens';
import { providers, sharedPwaLightModuleProviders } from './shared/providers/swProviders';
import {
  pwaWorkboxTokenProvider,
  workboxRegisterProvider,
} from './shared/providers/workboxProviders';
import { normalizeSwUrl } from './shared/utils/normalizeSwUrl';

export const TramvaiPwaWorkboxModule = declareModule({
  name: 'TramvaiPwaWorkboxModule',
  providers: [
    ...providers,
    provide({
      provide: PWA_SW_URL_TOKEN,
      useFactory: ({ swScope, swParams }) => {
        const swDest = process.env.TRAMVAI_PWA_SW_DEST as string;
        const swUrl = normalizeSwUrl(swDest, swScope);
        let finalSwUrl = swUrl;

        if (swParams && swParams.length) {
          const params = swParams
            .filter(Boolean)
            .reduce((acc, p) => {
              return acc.concat(
                Object.keys(p).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`)
              );
            }, [] as string[])
            .join('&');

          if (params) {
            finalSwUrl += `?${params}`;
          }
        }
        return finalSwUrl;
      },
      deps: {
        swScope: PWA_SW_SCOPE_TOKEN,
        swParams: optional(PWA_SW_PARAMS_TOKEN),
      },
    }),
    pwaWorkboxTokenProvider,
    ...(process.env.TRAMVAI_PWA_WORKBOX_ENABLED ? [workboxRegisterProvider] : []),
  ],
});

export const TramvaiPwaLightWorkboxModule = declareModule({
  name: 'TramvaiPwaLightWorkboxModule',
  providers: [...sharedPwaLightModuleProviders, pwaWorkboxTokenProvider, workboxRegisterProvider],
});
