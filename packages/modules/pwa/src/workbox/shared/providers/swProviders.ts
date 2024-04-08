import { Scope, provide } from '@tramvai/core';
import { PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN } from '../../../tokens';

export const providers = [
  provide({
    provide: PWA_SW_SCOPE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: () => {
      const swScope = process.env.TRAMVAI_PWA_SW_SCOPE as string;

      return swScope;
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
