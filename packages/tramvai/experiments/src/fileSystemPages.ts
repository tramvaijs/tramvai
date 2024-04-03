import type { Route } from '@tinkoff/router';
import { getParts } from '@tinkoff/router';
import fsPagesAndRoutes from '@tramvai/cli/lib/external/pages';

export const FILE_SYSTEM_PAGES_PREFIX = '@/';

export const fileSystemPagesEnabled = (): boolean =>
  !!process.env.__TRAMVAI_EXPERIMENTAL_ENABLE_FILE_SYSTEM_PAGES;

export const getStaticFileSystemPages = () => {
  return fsPagesAndRoutes.routes;
};

export const getExternalFileSystemPages = () => {
  return fsPagesAndRoutes.pages;
};

export const getAllFileSystemPages = () => {
  return { ...fsPagesAndRoutes.routes, ...fsPagesAndRoutes.pages };
};

export const getAllFileSystemLayouts = () => {
  return fsPagesAndRoutes.layouts;
};

export const getAllFileSystemErrorBoundaries = () => {
  return fsPagesAndRoutes.errorBoundaries;
};

export const getAllFileSystemWildcards = () => {
  return fsPagesAndRoutes.wildcards;
};

export const isFileSystemPageComponent = (pageComponent: string): boolean => {
  return (
    fileSystemPagesEnabled() &&
    !!pageComponent &&
    pageComponent.indexOf(FILE_SYSTEM_PAGES_PREFIX) === 0
  );
};

/**
 * @example
 * @/pages/index to /
 * @/pages/foo/bar/[id]/index to /foo/bar/:id/
 */
export const staticFileSystemPageToPath = (pageComponent: string): string => {
  return `/${pageComponent
    .replace(
      `${FILE_SYSTEM_PAGES_PREFIX}${process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_ROUTES_DIR}/`,
      ''
    )
    .replace(/\[(.+?)\]/g, ':$1')
    .replace(/index$/g, '')}`;
};

/**
 * @example
 * / to @/pages/index
 * /sub/route/:id/ to @/pages/sub/route/[id]/index
 */
export const pathToExternalFileSystemPage = (path: string): string => {
  const urlParts = getParts(path);

  const pageComponentParts = urlParts.map((part) => {
    // @example :id to [id]
    if (part.startsWith(':')) {
      return `[${part.replace(':', '')}]`;
    }
    return part;
  });

  return [
    `${FILE_SYSTEM_PAGES_PREFIX}${process.env.__TRAMVAI_EXPERIMENTAL_FILE_SYSTEM_PAGES_DIR}`,
    ...pageComponentParts,
    'index',
  ]
    .filter(Boolean)
    .join('/');
};

/**
 * @example
 * @/routes/index to @/routes/index__layout
 */
export const fileSystemPageToLayoutKey = (pageComponent: string): string => {
  return `${pageComponent}__layout`;
};

/**
 * @example
 * @/routes/index to @/routes/index__errorBoundary
 */
export const fileSystemPageToErrorBoundaryKey = (pageComponent: string): string => {
  return `${pageComponent}__errorBoundary`;
};

/**
 * @example
 * @/routes/index to /routes/*
 */
export const fileSystemPageToWildcardPath = (pageComponent: string): string => {
  const normalizedName = pageComponent.replace(/__wildcard$/g, '');
  const path = staticFileSystemPageToPath(normalizedName);

  return `${path}*`;
};

export const fileSystemPageToRoute = (pageComponent: string): Route => {
  const name = pageComponent;
  const path = staticFileSystemPageToPath(pageComponent);
  const layouts = getAllFileSystemLayouts();
  const errorBoundaries = getAllFileSystemErrorBoundaries();

  const route: Route = {
    name,
    path,
    config: {
      pageComponent,
    },
  };

  if (pageComponent in layouts) {
    route.config!.nestedLayoutComponent = fileSystemPageToLayoutKey(pageComponent);
  }

  if (pageComponent in errorBoundaries) {
    route.config!.errorBoundaryComponent = fileSystemPageToErrorBoundaryKey(pageComponent);
  }

  return route;
};

export const fileSystemPageComponentExists = (pageComponent: string): boolean => {
  return !!(
    getStaticFileSystemPages()[pageComponent] || getExternalFileSystemPages()[pageComponent]
  );
};

/**
 * @example
 * @/routes/index to @_routes_index
 */
export const fileSystemPageToWebpackChunkName = (pageComponent: string): string => {
  return pageComponent.replace(/\//g, '_');
};

export const getFileSystemWildcardRoutes = (): Route[] => {
  const wildcards = getAllFileSystemWildcards();

  return Object.keys(wildcards).map((name) => ({
    name,
    path: fileSystemPageToWildcardPath(name),
    config: {
      pageComponent: name,
    },
  }));
};
