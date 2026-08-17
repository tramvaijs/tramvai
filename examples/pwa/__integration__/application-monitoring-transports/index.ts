import { createApp, createBundle, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule, TramvaiRetryAssetsModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { SpaRouterModule } from '@tramvai/module-router';
import {
  ApplicationMonitoringModule,
  INLINE_REPORTER_EXTENSIONS_TOKEN,
  INLINE_REPORTER_TRANSPORTS_TOKEN,
} from '@tramvai/module-application-monitoring';

import Page from './page';
import { transportAFactory } from './transportA.inline';
import { transportBFactory } from './transportB.inline';
import { regionExtensionFactory } from './regionExtension.inline';

createApp({
  name: 'app-monitoring-transports',
  modules: [
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    ApplicationMonitoringModule,
    TramvaiRetryAssetsModule,
    SpaRouterModule.forRoot([
      {
        config: {
          bundle: 'mainDefault',
        },
        path: '/simple/',
        name: 'simple',
      },
    ]),
  ],
  bundles: {
    mainDefault: () =>
      Promise.resolve({
        default: createBundle({
          name: 'mainDefault',
          components: {
            pageDefault: Page,
          },
        }),
      }),
  },
  providers: [
    // two independent transports, registered from two independent providers - neither knows
    // about the other, proving they compose without coordination
    provide({
      provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
      multi: true,
      useValue: transportAFactory,
    }),
    provide({
      provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
      multi: true,
      useValue: transportBFactory,
    }),
    // an extension that only enriches one specific event
    provide({
      provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
      multi: true,
      useValue: regionExtensionFactory,
    }),
  ],
});
