import { declareModule, optional, provide } from '@tramvai/core';
import { MODERN_SATISFIES_TOKEN } from '@tramvai/tokens-render';
import { ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
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
      useFactory: ({ swScope, modern, envManager, swParams }) => {
        const swDest = process.env.TRAMVAI_PWA_SW_DEST as string;
        const swUrl = normalizeSwUrl(swDest, swScope);
        const hasModernBuild = !!process.env.TRAMVAI_MODERN_BUILD;
        const isCsrMode = envManager.get('TRAMVAI_FORCE_CLIENT_SIDE_RENDERING') === 'true';

        // tramvai modern build is not supported for CSR and not compatible with PWA module in CSR mode
        const addModernPrefix = modern && hasModernBuild && !isCsrMode;
        let finalSwUrl = swUrl;
        if (addModernPrefix) {
          finalSwUrl = finalSwUrl.replace(/\.js$/, '.modern.js');
        }

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
        modern: MODERN_SATISFIES_TOKEN,
        envManager: ENV_MANAGER_TOKEN,
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
