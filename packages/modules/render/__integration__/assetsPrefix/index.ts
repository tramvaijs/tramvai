import { createApp, provide } from '@tramvai/core';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import { ASSETS_PREFIX_TOKEN, DEFAULT_ASSETS_PREFIX_TOKEN } from '@tramvai/tokens-render';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

createApp({
  name: 'assets-prefix',
  modules,
  bundles,
  providers: [
    provide({
      provide: ASSETS_PREFIX_TOKEN,
      useFactory: ({ asyncLocalStorage, defaultAssetsPrefix }) => {
        return () => {
          const requestDi = asyncLocalStorage.getStore()?.tramvaiRequestDi;

          if (requestDi) {
            const pageService = requestDi.get(PAGE_SERVICE_TOKEN);
            const currentUrl = pageService.getCurrentUrl();

            if (currentUrl && currentUrl.query.customAssetsPrefix) {
              return process.env.PROXY_ASSETS_PREFIX;
            }
          }

          return defaultAssetsPrefix;
        };
      },
      deps: {
        asyncLocalStorage: ASYNC_LOCAL_STORAGE_TOKEN,
        defaultAssetsPrefix: DEFAULT_ASSETS_PREFIX_TOKEN,
      },
    }),
  ],
});
