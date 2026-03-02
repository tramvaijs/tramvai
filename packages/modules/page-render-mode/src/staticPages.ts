import { commandLineListTokens, DI_TOKEN, optional, provide, Scope } from '@tramvai/core';
import {
  CREATE_CACHE_TOKEN,
  ENV_MANAGER_TOKEN,
  LOGGER_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { FASTIFY_RESPONSE } from '@tramvai/tokens-server-private';
import {
  LINK_PREFETCH_MANAGER_TOKEN,
  PAGE_REGISTRY_TOKEN,
  PAGE_SERVICE_TOKEN,
  ROUTER_TOKEN,
} from '@tramvai/tokens-router';
import { SERVER_MODULE_PAPI_PRIVATE_ROUTE } from '@tramvai/tokens-server';
import { METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';
import { createPapiMethod } from '@tramvai/papi';
import { StopCommandLineRunnerError } from './error';
import {
  PAGE_RENDER_DEFAULT_MODE,
  STATIC_PAGES_CACHE_TOKEN,
  STATIC_PAGES_OPTIONS_TOKEN,
  STATIC_PAGES_COMMAND_LINE,
  STATIC_PAGES_BACKGROUND_FETCH_ENABLED,
  STATIC_PAGES_SHOULD_USE_CACHE,
  STATIC_PAGES_MODIFY_CACHE,
  STATIC_PAGES_CACHE_5xx_RESPONSE,
  STATIC_PAGES_KEY_TOKEN,
  STATIC_PAGES_FS_CACHE_ENABLED,
  STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN,
  STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN,
  STATIC_PAGES_SERVICE,
} from './tokens';
import { getPageRenderMode } from './utils/getPageRenderMode';
import { getCacheKey } from './utils/cacheKey';
import { BackgroundFetchService } from './staticPages/backgroundFetchService';
import { StaticPagesService } from './staticPages/staticPagesService';
import { FileSystemCache } from './staticPages/fileSystemCache';
import {
  STATIC_PAGES_BACKGROUND_FETCH_SERVICE,
  STATIC_PAGES_CACHE_METRICS_TOKEN,
  STATIC_PAGES_FS_CACHE_METRICS_TOKEN,
  STATIC_PAGES_FS_CACHE_TOKEN,
  STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE,
} from './private-tokens';

export const staticPagesProviders = [
  provide({
    provide: STATIC_PAGES_CACHE_METRICS_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ metrics }) => {
      return {
        hit: metrics.counter({
          name: 'static_pages_cache_hit',
          help: 'Total static pages returned from cache',
          labelNames: [],
        }),
      };
    },
    deps: {
      metrics: METRICS_MODULE_TOKEN,
    },
  }),
  provide({
    provide: STATIC_PAGES_CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ createCache, staticPagesOptions }) => {
      return createCache('memory', {
        name: 'static-pages',
        max: staticPagesOptions.maxSize,
      });
    },
    deps: {
      createCache: CREATE_CACHE_TOKEN,
      staticPagesOptions: STATIC_PAGES_OPTIONS_TOKEN,
    },
  }),
  provide({
    provide: STATIC_PAGES_OPTIONS_TOKEN,
    useValue: {
      // @TODO: unique ttl per pages
      ttl: 5 * 60 * 1000,
      maxSize: 100,
      allowStale: true,
      allowedHeaders: [],
    },
  }),
  provide({
    provide: STATIC_PAGES_KEY_TOKEN,
    useFactory: () => {
      return () => {
        return '';
      };
    },
  }),
  provide({
    provide: STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN,
    useValue: ({ ttl }) => {
      // prevent browser caching for pages in development mode
      if (process.env.NODE_ENV === 'development') {
        return 'private, no-cache, no-store, max-age=0, must-revalidate';
      }
      return `public, max-age=${ttl / 1000}`;
    },
  }),
  provide({
    provide: STATIC_PAGES_FS_CACHE_ENABLED,
    useValue: () => false,
  }),
  provide({
    provide: STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN,
    useFactory: () => {
      return {
        directory: process.env.__TRAMVAI_OUTPUT_STATIC ?? 'dist/static',
        maxSize: 1000,
        ttl: 5 * 60 * 1000,
        allowStale: true,
      };
    },
  }),
  provide({
    provide: STATIC_PAGES_FS_CACHE_METRICS_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ metrics }) => {
      return {
        hit: metrics.counter({
          name: 'static_pages_fs_cache_hit',
          help: 'Total static pages returned from file system cache',
          labelNames: [],
        }),
        miss: metrics.counter({
          name: 'static_pages_fs_cache_miss',
          help: 'Total static pages not found in file system cache',
          labelNames: [],
        }),
        size: metrics.gauge({
          name: 'static_pages_fs_cache_size',
          help: 'Number of files in file system cache',
          labelNames: [],
        }),
        bytes: metrics.gauge({
          name: 'static_pages_fs_cache_bytes',
          help: 'Total size of files in file system cache in bytes',
          labelNames: [],
        }),
      };
    },
    deps: {
      metrics: METRICS_MODULE_TOKEN,
    },
  }),
  provide({
    provide: STATIC_PAGES_FS_CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ fsCacheEnabled, fsCacheOptions, logger, metrics }) => {
      if (!fsCacheEnabled()) {
        return null;
      }

      return new FileSystemCache({
        ...fsCacheOptions,
        logger,
        metrics,
      });
    },
    deps: {
      fsCacheEnabled: STATIC_PAGES_FS_CACHE_ENABLED,
      fsCacheOptions: STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN,
      logger: LOGGER_TOKEN,
      metrics: STATIC_PAGES_FS_CACHE_METRICS_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    multi: true,
    scope: Scope.SINGLETON,
    useFactory: ({ fsCache, fsCacheEnabled }) => {
      return async function initFileSystemCache() {
        if (fsCacheEnabled() && fsCache) {
          await fsCache.init();
        }
      };
    },
    deps: {
      fsCache: STATIC_PAGES_FS_CACHE_TOKEN,
      fsCacheEnabled: STATIC_PAGES_FS_CACHE_ENABLED,
    },
  }),
  provide({
    provide: STATIC_PAGES_SHOULD_USE_CACHE,
    useFactory: ({ requestManager }) => {
      return () => {
        return (
          !requestManager.getHeader('x-tramvai-static-page-revalidate') &&
          !requestManager.getHeader('x-tramvai-prerender')
        );
      };
    },
    deps: {
      requestManager: REQUEST_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE,
    useFactory: ({ requestManager, pageService, router, defaultRenderMode, fileSystemCache }) => {
      return () =>
        getPageRenderMode({
          pageService,
          router,
          requestManager,
          defaultRenderMode,
          fileSystemCache,
        });
    },
    deps: {
      requestManager: REQUEST_MANAGER_TOKEN,
      router: optional(ROUTER_TOKEN),
      pageService: optional(PAGE_SERVICE_TOKEN),
      defaultRenderMode: PAGE_RENDER_DEFAULT_MODE,
      fileSystemCache: optional(STATIC_PAGES_FS_CACHE_TOKEN),
    },
  }),
  provide({
    provide: STATIC_PAGES_BACKGROUND_FETCH_ENABLED,
    useValue: () => {
      return true;
    },
  }),
  provide({
    provide: STATIC_PAGES_CACHE_5xx_RESPONSE,
    useValue: () => {
      return false;
    },
  }),
  provide({
    provide: STATIC_PAGES_BACKGROUND_FETCH_SERVICE,
    scope: Scope.SINGLETON,
    useClass: BackgroundFetchService,
    deps: {
      logger: LOGGER_TOKEN,
      envManager: ENV_MANAGER_TOKEN,
      backgroundFetchEnabled: STATIC_PAGES_BACKGROUND_FETCH_ENABLED,
    },
  }),
  provide({
    provide: STATIC_PAGES_SERVICE,
    scope: Scope.REQUEST,
    useClass: StaticPagesService,
    deps: {
      staticPagesKey: STATIC_PAGES_KEY_TOKEN,
      requestManager: REQUEST_MANAGER_TOKEN,
      responseManager: RESPONSE_MANAGER_TOKEN,
      response: FASTIFY_RESPONSE,
      environmentManager: ENV_MANAGER_TOKEN,
      logger: LOGGER_TOKEN,
      cache: STATIC_PAGES_CACHE_TOKEN,
      fsCache: STATIC_PAGES_FS_CACHE_TOKEN,
      fsCacheEnabled: STATIC_PAGES_FS_CACHE_ENABLED,
      modifyCache: { token: STATIC_PAGES_MODIFY_CACHE, optional: true },
      shouldUseCache: STATIC_PAGES_SHOULD_USE_CACHE,
      backgroundFetchService: STATIC_PAGES_BACKGROUND_FETCH_SERVICE,
      options: STATIC_PAGES_OPTIONS_TOKEN,
      cache5xxResponse: STATIC_PAGES_CACHE_5xx_RESPONSE,
      cacheControlFactory: STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    multi: true,
    scope: Scope.SINGLETON,
    useFactory: ({ di, staticPagesCommandLine }) => {
      return function registerResponseCacheHandler() {
        di.register({
          provide: staticPagesCommandLine
            ? commandLineListTokens[staticPagesCommandLine]
            : commandLineListTokens.customerStart,
          useFactory: ({
            staticPagesService,
            staticPagesCacheMetrics,
            logger,
            requestManager,
            responseManager,
            staticPagesKey,
            linkPrefetchManager,
            resolvePageRenderMode,
            router,
            pageRegistry,
          }) => {
            const log = logger('static-pages');

            return async function staticPagesFromCache() {
              const isPrerenderRequest = !!requestManager.getHeader('x-tramvai-prerender');
              const { pathname } = requestManager.getParsedUrl();
              const route = router?.getCurrentRoute() ?? router?.resolve(pathname);

              // prefetch route only for `tramvai static` because it can be async and slow in runtime
              if (isPrerenderRequest) {
                log.debug(
                  `Should prefetch route and component to determine if page is static: ${pathname}`
                );
                await linkPrefetchManager.prefetch(pathname);
                // for already resolved routes we can prefetch page component in runtime without significant performance impact
              } else if (route) {
                log.debug(
                  `Should prefetch page component to determine if page is static: ${pathname}`
                );
                await pageRegistry?.resolve(route).catch((error) => {
                  if (!route.redirect) {
                    log.info(`${pathname} page component for prefetch failed: ${error.message}`);
                  }
                });
              }

              const isStatic = resolvePageRenderMode() === 'static';
              const shouldUseCache = staticPagesService.shouldUseCache();

              if (isStatic) {
                responseManager.setHeader('X-Tramvai-Static-Page-Key', staticPagesKey());

                // we need to tell for `tramvai static` prerendering command that this page has `static` render mode,
                // and also provide route info to generate list of static routes in `dist/client/meta.json`.
                // this list will be used in `STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE` to determine render mode of the page in runtime before route resolving.
                if (isPrerenderRequest && route) {
                  responseManager.setHeader('X-Tramvai-Static-Page-Route', JSON.stringify(route));
                }

                if (shouldUseCache) {
                  log.debug(`Should use static pages cache: ${pathname}`);

                  await staticPagesService.respond(() => {
                    log.debug(`Successful static page response from cache: ${pathname}`);

                    staticPagesCacheMetrics.hit.inc();

                    throw new StopCommandLineRunnerError();
                  });
                } else {
                  log.debug(`Static pages cache is not used for this request: ${pathname}`);
                }
              }
            };
          },
          deps: {
            staticPagesService: STATIC_PAGES_SERVICE,
            staticPagesCacheMetrics: STATIC_PAGES_CACHE_METRICS_TOKEN,
            logger: LOGGER_TOKEN,
            requestManager: REQUEST_MANAGER_TOKEN,
            responseManager: RESPONSE_MANAGER_TOKEN,
            staticPagesKey: STATIC_PAGES_KEY_TOKEN,
            linkPrefetchManager: LINK_PREFETCH_MANAGER_TOKEN,
            resolvePageRenderMode: STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE,
            router: optional(ROUTER_TOKEN),
            pageRegistry: optional(PAGE_REGISTRY_TOKEN),
          },
        });
      };
    },
    deps: {
      di: DI_TOKEN,
      staticPagesCommandLine: { token: STATIC_PAGES_COMMAND_LINE, optional: true },
    },
  }),
  provide({
    provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
    useFactory: ({ staticPagesCache, fsCache, fsCacheEnabled, logger }) => {
      return createPapiMethod({
        path: '/revalidate/',
        method: 'post',
        async handler({ body = {}, headers }) {
          const log = logger('static-pages:revalidate');
          const { pathname, key = '' } = body;

          if (!pathname) {
            log.info({
              event: 'revalidate-all',
              request: body,
              headers,
            });

            staticPagesCache.clear();

            if (fsCacheEnabled() && fsCache) {
              await fsCache.clear();
            }
          } else {
            const cacheKey = getCacheKey({ pathname, key });

            log.info({
              event: 'revalidate-path',
              request: body,
              cacheKey,
            });

            if (key) {
              if (staticPagesCache.has(cacheKey)) {
                staticPagesCache.delete(cacheKey);
              }

              if (fsCacheEnabled() && fsCache && fsCache.has(cacheKey)) {
                await fsCache.delete(cacheKey);
              }
            } else {
              const memoryCaches = staticPagesCache.dump();

              for (const entry of memoryCaches) {
                if (entry[0].startsWith(`${pathname}^`)) {
                  staticPagesCache.delete(entry[0]);
                }
              }

              if (fsCacheEnabled() && fsCache) {
                const fsCaches = fsCache.dump();

                for (const entry of fsCaches) {
                  if (entry[0].startsWith(`${pathname}^`)) {
                    fsCache.delete(entry[0]);
                  }
                }
              }
            }
          }

          return 'Success';
        },
      });
    },
    deps: {
      staticPagesCache: STATIC_PAGES_CACHE_TOKEN,
      fsCache: STATIC_PAGES_FS_CACHE_TOKEN,
      fsCacheEnabled: STATIC_PAGES_FS_CACHE_ENABLED,
      logger: LOGGER_TOKEN,
    },
  }),
];
