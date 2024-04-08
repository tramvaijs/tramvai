import { declareModule, provide, Scope } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';
import { appConfig } from '@tramvai/cli/lib/external/config';
import { PWA_MANIFEST_URL_TOKEN, PWA_SW_SCOPE_TOKEN } from '../tokens';
import { registerWebManifestProvider, validateRelativeUrlProvider } from './shared/providers';

export const TramvaiPwaManifestModule = declareModule({
  name: 'TramvaiPwaManifestModule',
  providers: [
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ manifestUrl, swScope }) => {
        return {
          context: [manifestUrl],
          // appConfig.assetsPrefix available in 'development' mode
          target: appConfig.assetsPrefix ?? process.env.ASSETS_PREFIX ?? '',
          pathRewrite: (path: string) => {
            return path.replace(swScope, '/');
          },
        };
      },
      deps: {
        manifestUrl: PWA_MANIFEST_URL_TOKEN,
        swScope: PWA_SW_SCOPE_TOKEN,
      },
    }),
    provide({
      provide: PWA_MANIFEST_URL_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ swScope }) => {
        const manifestDest = process.env.TRAMVAI_PWA_MANIFEST_DEST as string;
        const normalizedUrl = manifestDest.startsWith('/') ? manifestDest : `/${manifestDest}`;
        const normalizedScope = swScope.replace(/\/$/, '');
        const finalUrl = `${normalizedScope}${normalizedUrl}`;

        return finalUrl;
      },
      deps: {
        swScope: PWA_SW_SCOPE_TOKEN,
      },
    }),
    ...(process.env.TRAMVAI_PWA_MANIFEST_ENABLED
      ? [registerWebManifestProvider, validateRelativeUrlProvider]
      : []),
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
