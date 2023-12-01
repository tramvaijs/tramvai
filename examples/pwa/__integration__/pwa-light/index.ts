import { Scope, createApp, createBundle, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
import { PROXY_CONFIG_TOKEN, ServerModule } from '@tramvai/module-server';
import {
  PWA_SW_SCOPE_TOKEN,
  PWA_SW_URL_TOKEN,
  TramvaiPwaLightModule,
} from '@tramvai/module-progressive-web-app';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';

createApp({
  name: 'pwa-light',
  modules: [
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    TramvaiPwaLightModule,
    ...modules,
  ],
  bundles,
  providers: [
    provide({
      provide: PWA_SW_URL_TOKEN,
      useValue: '/sw.js',
    }),
    provide({
      provide: PWA_SW_SCOPE_TOKEN,
      useValue: '/test',
    }),
    provide({
      provide: PROXY_CONFIG_TOKEN,
      scope: Scope.SINGLETON,
      useValue: {
        context: ['/sw.js', '/manifest.webmanifest'],
        target: 'http://localhost:4000/dist/client/',
      },
    }),
  ],
});
