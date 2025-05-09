import { commandLineListTokens, declareModule, provide, Scope } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';
import { ASSETS_PREFIX_TOKEN } from '@tramvai/tokens-render';
import { appConfig } from '@tramvai/cli/lib/external/config';
import { PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN } from '../tokens';
import { providers, sharedPwaLightModuleProviders } from './shared/providers/swProviders';
import { normalizeSwUrl } from './shared/utils/normalizeSwUrl';
import { validateRelativeUrl, validateSwScope } from './shared/utils/validateUrl';

const validateSwUrlAndScopeProvider = provide({
  provide: commandLineListTokens.init,
  useFactory: ({ swUrl, swScope }) =>
    function validateSwUrlAndScope() {
      if (!process.env.TRAMVAI_PWA_WORKBOX_ENABLED) {
        return;
      }

      validateSwScope(swScope);
      validateRelativeUrl(swUrl);
    },
  deps: {
    swUrl: PWA_SW_URL_TOKEN,
    swScope: PWA_SW_SCOPE_TOKEN,
  },
});

export const TramvaiPwaWorkboxModule = declareModule({
  name: 'TramvaiPwaWorkboxModule',
  providers: [
    ...providers,
    provide({
      provide: PWA_SW_URL_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ swScope }) => {
        const swDest = process.env.TRAMVAI_PWA_SW_DEST as string;
        return normalizeSwUrl(swDest, swScope);
      },
      deps: {
        swScope: PWA_SW_SCOPE_TOKEN,
      },
    }),
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ swUrl, swScope, assetsPrefixFactory }) => {
        return {
          context: [swUrl],
          // appConfig.assetsPrefix available in 'development' mode
          target: appConfig.assetsPrefix ?? assetsPrefixFactory() ?? '',
          pathRewrite: (path: string) => {
            return path.replace(swScope, '/');
          },
          // support local proxy for `tramvai start --https`
          secure: process.env.NODE_ENV !== 'development',
        };
      },
      deps: {
        swUrl: PWA_SW_URL_TOKEN,
        swScope: PWA_SW_SCOPE_TOKEN,
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
    validateSwUrlAndScopeProvider,
  ],
});

export const TramvaiPwaLightWorkboxModule = declareModule({
  name: 'TramvaiPwaLightWorkboxModule',
  providers: [...sharedPwaLightModuleProviders, validateSwUrlAndScopeProvider],
});
