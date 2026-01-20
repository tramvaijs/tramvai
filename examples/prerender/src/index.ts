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
import { LOGGER_TOKEN } from '@tramvai/tokens-common';

createApp({
  name: 'prerender',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    HttpClientModule,
    ErrorInterceptorModule,
  ],
  providers: [
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: {
        type: ResourceType.asIs,
        slot: ResourceSlot.HEAD_META,
        payload: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      },
    }),
    ...(typeof window === 'undefined'
      ? [
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
        ]
      : []),
  ],
});
