import { createApp } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';

import { SpaRouterModule } from '@tramvai/module-router';
import { formActionProvider } from './formActions';

createApp({
  name: 'form-actions',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([]),
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
  ],
  providers: [
    // Example of form action passed via providers
    formActionProvider,
  ],
});
