import { declareModule } from '@tramvai/core';
import { TramvaiPwaLightWorkboxModule, TramvaiPwaWorkboxModule } from './workbox/browser';
import { TramvaiPwaManifestModule, TramvaiPwaLightManifestModule } from './manifest/browser';
import { TramvaiPwaMetaModule } from './meta/browser';
import { providers as pwaBrowserProviders } from './pwa/browserProviders';

export * from './tokens';
export { createSelectActivePwaConfig } from './pwa/utils/selectActivePwaConfig';
export { TramvaiPwaWorkboxModule, TramvaiPwaManifestModule };

export const TramvaiPwaModule = declareModule({
  name: 'TramvaiPwaModule',
  imports: [TramvaiPwaWorkboxModule, TramvaiPwaManifestModule, TramvaiPwaMetaModule],
  providers: [...pwaBrowserProviders],
});

export const TramvaiPwaLightModule = /* @__PURE__ */ declareModule({
  name: 'TramvaiPwaLightModule',
  imports: [TramvaiPwaLightWorkboxModule, TramvaiPwaLightManifestModule],
  providers: [],
});
