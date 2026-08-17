import { commandLineListTokens, declareModule, provide, Scope } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';
import { ASSETS_PREFIX_TOKEN } from '@tramvai/tokens-render';
import { appConfig } from '@tramvai/cli/lib/external/config';
import { pwaConfigs } from '@tramvai/cli/lib/external/pwa';

import { PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN } from '../tokens';
import {
  providers as swProviders,
  sharedPwaLightModuleProviders,
} from './shared/providers/swProviders';
import { validateRelativeUrl, validateSwScope } from './shared/utils/validateUrl';

export const TramvaiPwaWorkboxModule = declareModule({
  name: 'TramvaiPwaWorkboxModule',
  providers: [
    ...swProviders,
    provide({
      provide: commandLineListTokens.init,
      useFactory: () =>
        function validateSwUrlAndScope() {
          pwaConfigs.forEach((pwaConfig) => {
            if (!pwaConfig.workbox.enabled) {
              return;
            }

            validateSwScope(pwaConfig.sw!.scope!);
            validateRelativeUrl(pwaConfig.sw!.url);
          });
        },
    }),
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ assetsPrefixFactory }) => {
        const swConfigs = pwaConfigs.map((pwaConfig) => pwaConfig.sw);

        return {
          context: swConfigs.map((swConfig) => swConfig!.url!),
          // appConfig.assetsPrefix available in 'development' mode
          target: appConfig.assetsPrefix ?? assetsPrefixFactory() ?? '',
          pathRewrite: (path: string) => {
            return swConfigs.reduce((acc: string, swConfig) => {
              return acc.replace(swConfig!.scope!, '/');
            }, path);
          },
          // support local proxy for `tramvai start --https`
          secure: process.env.NODE_ENV !== 'development',
        };
      },
      deps: {
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
  ],
});

export const TramvaiPwaLightWorkboxModule = declareModule({
  name: 'TramvaiPwaLightWorkboxModule',
  providers: [
    ...sharedPwaLightModuleProviders,
    provide({
      provide: commandLineListTokens.init,
      useFactory: ({ swUrl, swScope }) =>
        function validateSwUrlAndScope() {
          validateSwScope(swScope!);
          validateRelativeUrl(swUrl!);
        },
      deps: { swUrl: PWA_SW_URL_TOKEN, swScope: PWA_SW_SCOPE_TOKEN },
    }),
  ],
});
