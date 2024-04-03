import { declareModule } from '@tramvai/core';
import { TramvaiPwaLightWorkboxModule, TramvaiPwaWorkboxModule } from './workbox/browser';
import { TramvaiPwaManifestModule, TramvaiPwaLightManifestModule } from './manifest/browser';
import { TramvaiPwaMetaModule } from './meta/browser';

export * from './tokens';
export { TramvaiPwaWorkboxModule, TramvaiPwaManifestModule };

export const TramvaiPwaModule = declareModule({
  name: 'TramvaiPwaModule',
  imports: [TramvaiPwaWorkboxModule, TramvaiPwaManifestModule, TramvaiPwaMetaModule],
  providers: [],
});

export const TramvaiPwaLightModule = /* @__PURE__ */ declareModule({
  name: 'TramvaiPwaLightModule',
  imports: [TramvaiPwaLightWorkboxModule, TramvaiPwaLightManifestModule],
  providers: [],
});
