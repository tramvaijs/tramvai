import { declareModule, provide, Scope } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';
import { ASSETS_PREFIX_TOKEN } from '@tramvai/tokens-render';
import { appConfig } from '@tramvai/cli/lib/external/config';
import { PWA_MANIFEST_SCOPE_TOKEN, PWA_MANIFEST_URL_TOKEN, PWA_SW_SCOPE_TOKEN } from '../tokens';
import { registerWebManifestProvider, validateRelativeUrlProvider } from './shared/providers';

export const TramvaiPwaManifestModule = declareModule({
  name: 'TramvaiPwaManifestModule',
  providers: [
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ manifestUrl, swScope, manifestScope, assetsPrefixFactory }) => {
        return {
          context: [manifestUrl],
          // appConfig.assetsPrefix available in 'development' mode
          target: appConfig.assetsPrefix ?? assetsPrefixFactory() ?? '',
          pathRewrite: (path: string) => {
            return path.replace(manifestScope ?? swScope, '/');
          },
          // support local proxy for `tramvai start --https`
          secure: process.env.NODE_ENV !== 'development',
        };
      },
      deps: {
        manifestUrl: PWA_MANIFEST_URL_TOKEN,
        swScope: PWA_SW_SCOPE_TOKEN,
        manifestScope: PWA_MANIFEST_SCOPE_TOKEN,
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
    provide({
      provide: PWA_MANIFEST_SCOPE_TOKEN,
      scope: Scope.SINGLETON,
      useValue: process.env.TRAMVAI_PWA_MANIFEST_SCOPE,
    }),
    provide({
      provide: PWA_MANIFEST_URL_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ swScope, manifestScope }) => {
        const manifestDest = process.env.TRAMVAI_PWA_MANIFEST_DEST as string;
        const normalizedUrl = manifestDest.startsWith('/') ? manifestDest : `/${manifestDest}`;
        const normalizedScope = (manifestScope ?? swScope).replace(/\/$/, '');
        const finalUrl = `${normalizedScope}${normalizedUrl}`;

        return finalUrl;
      },
      deps: {
        swScope: PWA_SW_SCOPE_TOKEN,
        manifestScope: PWA_MANIFEST_SCOPE_TOKEN,
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
