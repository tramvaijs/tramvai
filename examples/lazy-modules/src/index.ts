import { createApp, provide, optional } from '@tramvai/core';
import { commandLineListTokens } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { ROUTER_GUARD_TOKEN } from '@tramvai/tokens-router';
import { RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import {
  LazyModulesRegistryModule,
  LAZY_MODULES_REGISTRY_TOKEN,
} from './modules/LazyModulesRegistryModule';

createApp({
  name: 'lazy-modules',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([
      {
        name: 'old-catalog',
        path: '/old/',
        config: {
          bundle: 'catalogBundle',
          pageComponent: 'catalogBundle/CatalogPage',
        },
      },
    ]),
    RenderModule,
    ServerModule,
    ErrorInterceptorModule,
    LazyModulesRegistryModule,
  ],
  providers: [
    provide({
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: ({ registry }) => {
        return function registerLazyModules() {
          registry.add(
            'currency',
            () => import(/* webpackChunkName: "currency" */ './modules/ImperativeModule')
          );
        };
      },
      deps: { registry: LAZY_MODULES_REGISTRY_TOKEN },
    }),
    provide({
      provide: ROUTER_GUARD_TOKEN,
      multi: true,
      useFactory: ({ registry, resourcesRegistry }: any) => {
        return async (navigation: any) => {
          if (navigation.to?.path === '/imperative/') {
            await registry.load(['currency']);

            if (resourcesRegistry && typeof window === 'undefined') {
              const resources = await registry.preload(['currency']);
              resources.forEach((r: any) => resourcesRegistry.register(r));
            }
          }
        };
      },
      deps: {
        registry: LAZY_MODULES_REGISTRY_TOKEN,
        resourcesRegistry: optional(RESOURCES_REGISTRY),
      },
    }),
  ],
  bundles: {
    catalogBundle: () => import(/* webpackChunkName: "catalogBundle" */ './bundles/catalogBundle'),
  },
});
