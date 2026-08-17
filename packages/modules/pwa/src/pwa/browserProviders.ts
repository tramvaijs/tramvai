import { provide } from '@tramvai/core';
import { pwaConfigs } from '@tramvai/cli/lib/external/pwa';

import { PWA_ACTIVE_CONFIG_TOKEN, PWA_RESOLVE_TOKEN } from '../tokens';
import { sharedProviders } from './sharedProviders';

export const providers = [
  ...sharedProviders,
  provide({
    provide: PWA_ACTIVE_CONFIG_TOKEN,
    useFactory: ({ resolvePwaConfig }) => {
      const currentPath = window.location.pathname ?? '/';

      return resolvePwaConfig(pwaConfigs, currentPath)!;
    },
    deps: {
      resolvePwaConfig: PWA_RESOLVE_TOKEN,
    },
  }),
];
