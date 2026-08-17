import { declareModule, provide } from '@tramvai/core';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import type { PwaMetaOptions } from '@tramvai/plugin-base-builder/lib/types';
import { PWA_ACTIVE_CONFIG_TOKEN } from '../tokens';

const metaMap: Record<keyof PwaMetaOptions, string> = {
  viewport: 'viewport',
  themeColor: 'theme-color',
  mobileApp: 'mobile-web-app-capable',
  mobileAppIOS: 'apple-mobile-web-app-capable',
  appleTitle: 'apple-mobile-web-app-title',
  appleStatusBarStyle: 'apple-mobile-web-app-status-bar-style',
};

export const TramvaiPwaMetaModule = declareModule({
  name: 'TramvaiPwaMetaModule',
  providers: [
    provide({
      provide: RENDER_SLOTS,
      useFactory: ({ activeConfig }) => {
        const finalMeta = activeConfig?.meta ?? {};
        const keys = Object.keys(finalMeta) as Array<keyof PwaMetaOptions>;

        return keys.map((key) => {
          const metaName = metaMap[key];
          const metaValue = finalMeta[key];

          return {
            type: ResourceType.asIs,
            slot: ResourceSlot.HEAD_META,
            payload: `<meta name="${metaName}" content="${metaValue}">`,
          };
        });
      },
      deps: {
        activeConfig: PWA_ACTIVE_CONFIG_TOKEN,
      },
    }),
  ],
});
