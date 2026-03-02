import { commandLineListTokens, createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { PRERENDER_HOOKS_TOKEN, SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import { HttpClientModule } from '@tramvai/module-http-client';
import { CACHE_WARMUP_HOOKS_TOKEN } from '@tramvai/module-cache-warmup';
import { LOGGER_TOKEN, REQUEST_MANAGER_TOKEN } from '@tramvai/tokens-common';
import {
  PageRenderModeModule,
  STATIC_PAGES_FS_CACHE_ENABLED,
  STATIC_PAGES_KEY_TOKEN,
  STATIC_PAGES_OPTIONS_TOKEN,
} from '@tramvai/module-page-render-mode';
import { USER_AGENT_TOKEN } from '@tramvai/module-client-hints';

createApp({
  name: 'prerender',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([
      {
        name: 'redirect',
        path: '/redirect/',
        redirect: '/',
        config: {
          pageRenderMode: 'static',
        },
      },
    ]),
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    HttpClientModule,
    ErrorInterceptorModule,
    PageRenderModeModule,
  ],
  providers:
    typeof window === 'undefined'
      ? [
          provide({
            provide: RENDER_SLOTS,
            multi: true,
            useValue: {
              type: ResourceType.asIs,
              slot: ResourceSlot.HEAD_META,
              payload: '<meta name="viewport" content="width=device-width, initial-scale=1">',
            },
          }),
          provide({
            provide: commandLineListTokens.init,
            useFactory: ({ hooks }) => {
              return async function addPrerenderRoutes() {
                hooks['prerender:routes'].tapPromise(
                  'AddPrerenderRoutesPlugin',
                  async (_, routes) => {
                    await new Promise<void>((resolve) => setTimeout(resolve, 100));

                    routes.push('/1/test/1/');
                    routes.push('/2/test/2/');
                    routes.push('/3/test/3/');

                    routes.push({
                      pathname: '/',
                      headers: {
                        'User-Agent':
                          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                      },
                    });
                    routes.push({
                      pathname: '/',
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
                      },
                    });
                    routes.push({
                      pathname: '/',
                      query: {
                        utm_source: 'prerender',
                        utm_medium: 'example',
                      },
                    });
                  }
                );
              };
            },
            deps: {
              hooks: PRERENDER_HOOKS_TOKEN,
            },
          }),
          provide({
            provide: commandLineListTokens.init,
            useFactory: ({ hooks }) => {
              return async function filterPrerenderRoutes() {
                hooks['prerender:generate'].tapPromise(
                  'FilterPrerenderRoutesPlugin',
                  async (_, route) => {
                    await new Promise<void>((resolve) => setTimeout(resolve, 100));

                    if (route.actualPath.includes('/second')) {
                      route.prerenderSkip = true;
                    }
                    if (route.actualPath.includes('/3/test/3')) {
                      route.prerenderSkip = true;
                    }
                  }
                );
              };
            },
            deps: {
              hooks: PRERENDER_HOOKS_TOKEN,
            },
          }),
          provide({
            provide: commandLineListTokens.listen,
            useFactory: ({ hooks, logger }) => {
              return async function filterWarmupRoutes() {
                const log = logger('cache-warmup');

                hooks['cache-warmup:request'].wrap(async (_, payload, next) => {
                  if (
                    payload.parameters.url?.includes('/second') ||
                    payload.parameters.url?.includes('/3/test/3')
                  ) {
                    log.info(`Skipping cache warmup for "${payload.parameters.url}"`);
                    return {
                      parameters: payload.parameters,
                      result: 'skipped',
                    };
                  }
                  return next(payload);
                });
              };
            },
            deps: {
              hooks: CACHE_WARMUP_HOOKS_TOKEN,
              logger: LOGGER_TOKEN,
            },
          }),
          provide({
            provide: STATIC_PAGES_FS_CACHE_ENABLED,
            useValue: () => true,
          }),
          provide({
            provide: STATIC_PAGES_KEY_TOKEN,
            useFactory: ({ userAgent, requestManager }) => {
              return () => {
                const { query } = requestManager.getParsedUrl();
                const isMobile = userAgent.device.type === 'mobile';

                if (query.utm_source === 'prerender' && query.utm_medium === 'example') {
                  return 'query';
                }

                if (isMobile) {
                  return 'mobile';
                }

                return 'desktop';
              };
            },
            deps: {
              userAgent: USER_AGENT_TOKEN,
              requestManager: REQUEST_MANAGER_TOKEN,
            },
          }),
          provide({
            provide: STATIC_PAGES_OPTIONS_TOKEN,
            useValue: {
              ttl: 5 * 60 * 1000,
              maxSize: 100,
              allowStale: true,
              // if `User-Agent` header is used for cache key, it should be included in allowedHeaders, to include that header in background cache revalidation request
              allowedHeaders: ['User-Agent'],
            },
          }),
        ]
      : [],
});
