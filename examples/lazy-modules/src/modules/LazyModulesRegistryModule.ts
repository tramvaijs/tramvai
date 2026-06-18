import { createToken, declareModule, provide, optional, Scope } from '@tramvai/core';
import { ROOT_DI_TOKEN } from '@tramvai/core';
import type { PageResource } from '@tramvai/tokens-render';
import { FETCH_WEBPACK_STATS_TOKEN, ResourceType, ResourceSlot } from '@tramvai/tokens-render';

export interface LazyModulesRegistry {
  add(name: string, loader: () => Promise<any>): void;
  load(names: string[]): Promise<void>;
  preload(names: string[]): Promise<PageResource[]>;
}

export const LAZY_MODULES_REGISTRY_TOKEN = createToken<LazyModulesRegistry>('lazyModulesRegistry');

export const LazyModulesRegistryModule = declareModule({
  name: 'LazyModulesRegistryModule',
  providers: [
    provide({
      provide: LAZY_MODULES_REGISTRY_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ rootContainer, fetchWebpackStats }: any) => {
        const loaders = new Map<string, () => Promise<any>>();

        return {
          add(name, loader) {
            loaders.set(name, loader);
          },

          async load(names) {
            const results = await Promise.all(
              names.map((name) => {
                const loader = loaders.get(name);
                if (!loader) throw new Error(`Lazy module "${name}" not found`);
                return loader();
              })
            );
            const modules = results.map((m) => ('default' in m ? m.default : m));
            rootContainer.registerModules(modules);
          },

          async preload(names) {
            if (!fetchWebpackStats) {
              return [];
            }

            const stats = await fetchWebpackStats();
            const { publicPath } = stats;
            const resources: PageResource[] = [];

            for (const name of names) {
              const chunkFiles = stats.assetsByChunkName[name] ?? [];
              for (const file of chunkFiles) {
                if (file.endsWith('.js')) {
                  resources.push({
                    type: ResourceType.preloadLink,
                    slot: ResourceSlot.HEAD_CORE_SCRIPTS,
                    payload: `${publicPath}${file}`,
                    attrs: { as: 'script' },
                  });
                }
              }
            }

            return resources;
          },
        };
      },
      deps: {
        rootContainer: ROOT_DI_TOKEN,
        fetchWebpackStats: optional(FETCH_WEBPACK_STATS_TOKEN),
      },
    }),
  ],
});
