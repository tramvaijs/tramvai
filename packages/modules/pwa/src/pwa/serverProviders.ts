import { provide } from '@tramvai/core';
import { PAGE_SERVICE_TOKEN } from '@tramvai/module-router';
import { pwaConfigs } from '@tramvai/cli/lib/external/pwa';

import { PWA_ACTIVE_CONFIG_TOKEN, PWA_RESOLVE_TOKEN } from '../tokens';
import { sharedProviders } from './sharedProviders';

export const providers = [
  ...sharedProviders,
  provide({
    provide: PWA_ACTIVE_CONFIG_TOKEN,
    useFactory: ({ pageService, resolvePwaConfig }) => {
      const currentPath = pageService.getCurrentUrl()?.path ?? '/';

      return resolvePwaConfig(pwaConfigs, currentPath)!;
    },
    deps: {
      pageService: PAGE_SERVICE_TOKEN,
      resolvePwaConfig: PWA_RESOLVE_TOKEN,
    },
  }),
];
