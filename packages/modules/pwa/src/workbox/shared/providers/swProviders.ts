import { provide } from '@tramvai/core';

import { PWA_ACTIVE_CONFIG_TOKEN, PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN } from '../../../tokens';

export const providers = [
  provide({
    provide: PWA_SW_SCOPE_TOKEN,
    useFactory: ({ activePwaConfig }) => {
      return activePwaConfig?.sw?.scope;
    },
    deps: {
      activePwaConfig: PWA_ACTIVE_CONFIG_TOKEN,
    },
  }),
];

export const sharedPwaLightModuleProviders = [
  provide({
    provide: PWA_SW_SCOPE_TOKEN,
    useValue: '/',
  }),
  provide({
    provide: PWA_SW_URL_TOKEN,
    useValue: '/sw.js',
    deps: {
      swScope: PWA_SW_SCOPE_TOKEN,
    },
  }),
];
