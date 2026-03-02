import './typings';

import { declareModule, provide } from '@tramvai/core';
import { REQUEST_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { PAGE_SERVICE_TOKEN, ROUTER_TOKEN } from '@tramvai/tokens-router';
import { ForceCSRModule } from './ForceCSRModule';
import { sharedProviders } from './shared';
import { STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE } from './private-tokens';
import { getPageRenderMode } from './utils/getPageRenderMode';
import { PAGE_RENDER_DEFAULT_MODE } from './tokens';

export * from './tokens';

// @todo: перенести в @tramvai/module-render
export const PageRenderModeModule = declareModule({
  name: 'PageRenderModeModule',
  imports: [ForceCSRModule],
  providers: [
    ...sharedProviders,
    provide({
      provide: STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE,
      useFactory: ({ requestManager, pageService, router, defaultRenderMode }) => {
        return () =>
          getPageRenderMode({
            pageService,
            router,
            requestManager,
            defaultRenderMode,
          });
      },
      deps: {
        requestManager: REQUEST_MANAGER_TOKEN,
        router: ROUTER_TOKEN,
        pageService: PAGE_SERVICE_TOKEN,
        defaultRenderMode: PAGE_RENDER_DEFAULT_MODE,
      },
    }),
  ],
});
