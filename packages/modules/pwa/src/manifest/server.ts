import { declareModule, provide, Scope } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';
import { ASSETS_PREFIX_TOKEN } from '@tramvai/tokens-render';
import { appConfig } from '@tramvai/cli/lib/external/config';
import { pwaConfigs, manifestEnabled } from '@tramvai/cli/lib/external/pwa';

import { PWA_ACTIVE_CONFIG_TOKEN, PWA_MANIFEST_URL_TOKEN, PWA_SW_SCOPE_TOKEN } from '../tokens';
import {
  registerWebManifestProvider,
  validateManifestUrlsProvider,
  validateRelativeUrlProvider,
} from './shared/providers';

export const TramvaiPwaManifestModule = declareModule({
  name: 'TramvaiPwaManifestModule',
  providers: [
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ assetsPrefixFactory }) => {
        const webManifests = pwaConfigs.map((pwaConfig) => pwaConfig.webmanifest);

        return {
          context: webManifests.map((webmanifest) => webmanifest!.url!),
          // appConfig.assetsPrefix available in 'development' mode
          target: appConfig.assetsPrefix ?? assetsPrefixFactory() ?? '',
          pathRewrite: (path: string) => {
            return pwaConfigs.reduce((acc: string, pwaConfig) => {
              return acc.replace(pwaConfig.webmanifest!.scope! ?? pwaConfig.sw!.scope!, '/');
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
    provide({
      provide: PWA_MANIFEST_URL_TOKEN,
      useFactory: ({ pwaActiveConfig }) => {
        return pwaActiveConfig?.webmanifest?.url;
      },
      deps: {
        pwaActiveConfig: PWA_ACTIVE_CONFIG_TOKEN,
      },
    }),
    ...(manifestEnabled ? [registerWebManifestProvider, validateManifestUrlsProvider] : []),
  ],
});

export const TramvaiPwaLightManifestModule = declareModule({
  name: 'TramvaiPwaLightManifestModule',
  providers: [
    provide({
      provide: PWA_MANIFEST_URL_TOKEN,
      useValue: '/manifest.webmanifest',
    }),
    provide({
      provide: PWA_SW_SCOPE_TOKEN,
      useValue: '/',
    }),
    registerWebManifestProvider,
    validateRelativeUrlProvider,
  ],
});
