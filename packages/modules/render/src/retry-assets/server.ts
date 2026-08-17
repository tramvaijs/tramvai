import { declareModule, provide } from '@tramvai/core';
import {
  ASSETS_PREFIX_TOKEN,
  GET_RETRY_URL,
  RENDER_SLOTS,
  RETRY_HOSTNAME_MAP,
  ResourceSlot,
  ResourceType,
} from '@tramvai/tokens-render';
import { retryAssets } from './retry-assets.inline';
import { getRetryUrl } from './get-retry-url.inline';
import { providers } from './providers';

export const TramvaiRetryAssetsModule = declareModule({
  name: 'TramvaiRetryAssetsModule',
  providers: [
    ...providers,
    provide({
      provide: RENDER_SLOTS,
      useFactory: ({ retryMap, assetsPrefixFactory }) => {
        const assetsPrefix = assetsPrefixFactory();
        // allow retry testing in development mode, where assets are served
        // from the local static server instead of a CDN
        const relevantAssetsPrefix =
          process.env.NODE_ENV === 'development' && assetsPrefix === 'static'
            ? `http://${process.env.HOST_STATIC}:${process.env.PORT_STATIC}/dist/`
            : assetsPrefix;

        return {
          slot: ResourceSlot.HEAD_PERFORMANCE,
          type: ResourceType.inlineScript,
          payload: `(${retryAssets.toString()})(${JSON.stringify(retryMap)},${getRetryUrl.toString()},${JSON.stringify(relevantAssetsPrefix)})`,
        };
      },
      deps: {
        retryMap: RETRY_HOSTNAME_MAP,
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
  ],
});
