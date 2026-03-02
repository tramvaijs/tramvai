import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { TramvaiRenderMode } from '@tramvai/tokens-render';
import type { PAGE_SERVICE_TOKEN, ROUTER_TOKEN } from '@tramvai/tokens-router';
import type { PageComponent } from '@tramvai/react';
import { REQUEST_MANAGER_TOKEN } from '@tramvai/tokens-common';
import type { PAGE_RENDER_DEFAULT_MODE } from '../tokens';
import { STATIC_PAGES_FS_CACHE_TOKEN } from '../private-tokens';

export const getPageRenderMode = ({
  requestManager,
  router,
  pageService,
  defaultRenderMode,
  fileSystemCache,
}: {
  requestManager: ExtractDependencyType<typeof REQUEST_MANAGER_TOKEN>;
  router: ExtractDependencyType<typeof ROUTER_TOKEN> | null;
  pageService: ExtractDependencyType<typeof PAGE_SERVICE_TOKEN> | null;
  defaultRenderMode: ExtractDependencyType<typeof PAGE_RENDER_DEFAULT_MODE>;
  fileSystemCache?: ExtractDependencyType<typeof STATIC_PAGES_FS_CACHE_TOKEN> | null;
}): TramvaiRenderMode => {
  const resolvedRoute =
    router?.getCurrentRoute() ?? router?.resolve(requestManager.getParsedUrl().pathname);

  // if we can't resolve route, it means that we are on 404 page, or has dynamic routing,
  // so we can't determine render mode by page config or page component property, and should fallback to default render mode
  if (!resolvedRoute) {
    return typeof defaultRenderMode === 'function' ? defaultRenderMode() : defaultRenderMode;
  }

  // fast way for prerendered pages to determine render mode without full route resolving
  if (
    fileSystemCache &&
    // TODO: refactor for log(1) complexity
    fileSystemCache.staticPages.some(
      (item) => item.path === resolvedRoute.path || item.name === resolvedRoute.name
    )
  ) {
    return 'static';
  }

  const { pageComponent, pageRenderMode } =
    (pageService!.getCurrentRoute() ? pageService!.getConfig() : resolvedRoute.config) ?? {};
  const { renderMode } = (pageService!.getComponent(pageComponent!) as PageComponent) ?? {};
  const mode = pageRenderMode || renderMode || defaultRenderMode;

  return typeof mode === 'function' ? mode() : mode;
};
