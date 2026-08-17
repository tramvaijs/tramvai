import { createApp, provide } from '@tramvai/core';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { TramvaiRetryAssetsModule } from '@tramvai/module-render';
import {
  RENDER_SLOTS,
  RETRY_HOSTNAME_MAP,
  ResourceSlot,
  ResourceType,
} from '@tramvai/tokens-render';

const staticPort = process.env.PORT_STATIC;
const fallbackCdnPort = process.env.FALLBACK_CDN_PORT;

createApp({
  name: 'retry-assets',
  modules: [...modules, TramvaiRetryAssetsModule],
  bundles,
  providers: [
    // Two retry modes are tested:
    // - default: retry to another host `localhost:<staticPort>` -> `localhost:<fallbackCdnPort>`,
    //   the fallback CDN is a proxy to the same static server, so the retry succeeds there;
    // - `RETRY_TO_SAME_URL`: empty map, `getRetryUrl` returns the original url,
    //   so the asset is re-requested from the same host.
    provide({
      provide: RETRY_HOSTNAME_MAP,
      useValue:
        process.env.RETRY_TO_SAME_URL === 'true'
          ? {}
          : {
              [`localhost:${staticPort}`]: `localhost:${fallbackCdnPort}`,
            },
    }),
    // critical script, blocked in tests to trigger the retry
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: {
        type: ResourceType.script,
        slot: ResourceSlot.HEAD_CORE_SCRIPTS,
        payload: `http://localhost:${staticPort}/public/retry-target.js`,
        attrs: {
          'data-critical': 'true',
          integrity: 'sha256-test',
          'data-test': 'test',
        },
      },
    }),
    // critical stylesheet, goes through the `retryLink` branch
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: {
        type: ResourceType.style,
        slot: ResourceSlot.HEAD_CORE_STYLES,
        payload: `http://localhost:${staticPort}/public/retry-target.css`,
        attrs: {
          'data-critical': 'true',
        },
      },
    }),
    // asset without `data-critical`, must NOT be retried
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: {
        type: ResourceType.script,
        slot: ResourceSlot.HEAD_CORE_SCRIPTS,
        payload: `http://localhost:${staticPort}/public/non-critical.js`,
        attrs: {},
      },
    }),
  ],
});
