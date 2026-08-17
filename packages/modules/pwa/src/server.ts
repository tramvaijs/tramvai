import { declareModule } from '@tramvai/core';
import { TramvaiPwaLightWorkboxModule, TramvaiPwaWorkboxModule } from './workbox/server';
import { TramvaiPwaManifestModule, TramvaiPwaLightManifestModule } from './manifest/server';
import { TramvaiPwaMetaModule } from './meta/server';
import { providers as pwaServerProviders } from './pwa/serverProviders';

export * from './tokens';
export { createSelectActivePwaConfig } from './pwa/utils/selectActivePwaConfig';
export { TramvaiPwaWorkboxModule, TramvaiPwaManifestModule };

export const TramvaiPwaModule = declareModule({
  name: 'TramvaiPwaModule',
  imports: [TramvaiPwaWorkboxModule, TramvaiPwaManifestModule, TramvaiPwaMetaModule],
  providers: [...pwaServerProviders],
});

export const TramvaiPwaLightModule = /* @__PURE__ */ declareModule({
  name: 'TramvaiPwaLightModule',
  imports: [TramvaiPwaLightWorkboxModule, TramvaiPwaLightManifestModule],
  providers: [],
});
