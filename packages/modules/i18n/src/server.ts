import { declareModule, provide } from '@tramvai/core';
import type { I18nConfiguration } from './types';
import { I18N_CONFIGURATION_TOKEN } from './tokens';
import { sharedProviders } from './shared/providers';
import { defaultConfiguration } from './shared/config';

export * from './tokens';
export * from './types';
export * from './shared/store';
export * from './shared/hooks';
export * from './shared/constants';

export const I18nModule = /* @__PURE__ */ declareModule({
  name: 'I18nModule',
  providers: [...sharedProviders],
  extend: {
    forRoot(config: I18nConfiguration) {
      return [
        provide({
          provide: I18N_CONFIGURATION_TOKEN,
          useValue: {
            ...defaultConfiguration,
            ...config,
          },
        }),
      ];
    },
  },
});
