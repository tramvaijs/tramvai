---
id: module
title: Module
sidebar_position: 4
---

Modules are the implementation of some limited functionality of the application using the DI system and providers.

In general, module is just a list of providers, with some specific logic, for example deduplication by module name.

## Module life cycle

### Initializing the application

When creating an application, all declared [providers](concepts/provider.md) are processed, which will fall into the general [DI](concepts/di.md) container.

### Handling customer requests

The module is instantiated once on the server (and used for all clients), after initializing the application, and once in the browser, after loading the page and initializing the client side. These instances contain instances of the classes that were passed to `deps` and will be passed to the module's constructor:

```tsx
import { Module } from '@tramvai/core';

@Module({
  providers: [],
  deps: {
    log: 'log',
  },
})
class TestModule {
  constructor({ log }) {
    log.info('TestModule created');
  }
}
```

## Example module

The main functionality of the module is in the `providers` list. Each provider either adds new functionality, for example, makes available in all other modules the constant value `New` under the key `Token`:

```tsx
import { Module, provide } from '@tramvai/core';

@Module({
  providers: [
    provide({
      provide: 'Token',
      useValue: 'New',
    }),
  ],
})
class TestModule {}
```

Or it uses tokens from other modules, for example, adding a new environment parameter via the `ENV_USED_TOKEN` token, which will be processed by the EnvModule:

```tsx
import { Module, provide } from '@tramvai/core';
import { ENV_USED_TOKEN } from '@tramvai/module-common';

@Module({
  providers: [
    provide({
      provide: ENV_USED_TOKEN,
      multi: true,
      useValue: [
        {
          key: 'ENV_VARIABLE',
          value: 'New',
          optional: true,
        },
      ],
    }),
  ],
})
class TestModule {}
```

## Import in module third party modules

Modules can be imported internally by providers of third-party modules. Thus, allowing you to build a chain of interconnected modules.

Code example

```tsx
import { Module } from '@tramvai/core';
import { LogModule } from '@tramvai/module-log';

@Module({
  providers: [],
  imports: [LogModule],
})
class TestModule {}
```

In this case, when initializing TestModule, the providers from the ModuleLogger module and nested imports, if present, will be initialized beforehand.

## Dynamic modules

Modules can be configured in two ways, and both methods can be used simultaneously:

- passing parameters to `module`
- return parameters in the static method `forRoot`

An example of a dynamic module, in which we will add dependencies `metaGenerate` to the DI in the first way and `meta-list` in the second, and one of them depends on the other:

```tsx
import { Module, provide } from '@tramvai/core';

@Module({
  providers: [
    provide({
      provide: 'metaGenerate',
      useClass: class MetaGenerate {},
      deps: {
        list: 'meta-list',
      },
    }),
  ],
})
export class SeoModule {
  static forRoot({ metaList }: { metaList?: string[] }) {
    if (metaList) {
      return {
        mainModule: SeoModule,
        providers: [
          provide({
            provide: 'meta-list',
            useValue: metaList,
          }),
        ],
      };
    }
  }
}
```

A static method must return an object with an interface:

```tsx
type staticModule = {
  mainModule: Module; // Link to the main module, from which we will extract all the basic information
  providers: Provider[]; // Providers to be added to DI
};
```

Now this module contains a static method `forRoot` which adds additional `providers` to the standard `SeoModule` module. Without this construct, we would need to explicitly write providers in the application. All data that has been added to the `SeoModule` will be inherited and expanded.

Now we can call our static method in the application or in other modules. And the result of execution of `forRoot` will be added to` DI`

```tsx
import { Module } from '@tramvai/core';
import { SeoModule } from './SeoModule';
import { metaFromConfig } from './metaFromConfig';

@Module({
  imports: [SeoModule.forRoot([metaFromConfig])],
})
export class ApplicationModule {}
```

It should be borne in mind that the `forRoot` construction should only simplify the use of the module and we should also maintain the functionality of the module through the usual configuration of `providers`

## Recommendations for modules

### Low coupling

It is advisable to build modules so that they do not directly depend on other modules. Coupling only needs to be interface-based and replaceable. Otherwise, it will not be possible to simply replace modules and refactor.

### Small size

The larger the module, the more code it contains inside and the more potentially it has connections and reasons for changes.

For this reason, the module will be more difficult to change and there will be a greater chance of breaking functionality when changed.

It is desirable that the modules implement some small part of the functionality.

### Optional dependencies / configuration

It is convenient to use the module if it does not require any configuration and works normally by default. But, if it is clear that for some applications and cases additional behavior setting will be needed, then it is advisable to use optional dependencies that can be defined in the application.

It is worth marking non-critical functionality with optional dependencies, which the module does not necessarily need. So that you can not implement interfaces and throw out some of the logic. For example, logging

```tsx
// @todo example of optional dependency
```

### Debugging Modules

It is recommended to specify in the module documentation the unique identifier / namespace of the logger, which is used in this module. Example module id for `@tramvai/module-server`:

```tsx
const log = logger('server'); // get a logger instance by LOGGER_TOKEN token
```

### When to create a module, and when not?

Add providers in `createApp` in a simple cases, for example:

- When you need to configure any module
- When you need one simple provider and module will be overhead

In any other cases, our recommendation to create an independend modules for any features, for example:

- metrics
- logger
- auth strategy
- API client
- fonts
- domain logic

## Lazy modules

By default, all modules are registered at app initialization and their code is included in the main bundle. Lazy modules allow you to defer module registration until a specific page is loaded — the module code lands in the page or bundle chunk, and providers are registered in the root DI container on demand.

### In page components (File-System Routing)

Add a `modules` static property to a page component. Module code will be included in the page chunk and registered when the page loads:

```tsx
import type { PageComponent } from '@tramvai/react';
import { PaymentModule } from './modules/PaymentModule';

const CheckoutPage: PageComponent = () => {
  const paymentService = useDi(PAYMENT_SERVICE_TOKEN);
  return <PaymentForm service={paymentService} />;
};

CheckoutPage.modules = [PaymentModule];

export default CheckoutPage;
```

### In bundles

Add a `modules` field to `createBundle`. Module code will be included in the bundle chunk and registered when the bundle loads:

```tsx
import { createBundle } from '@tramvai/core';
import { AnalyticsModule } from './modules/AnalyticsModule';

export default createBundle({
  name: 'checkout',
  components: { CheckoutPage },
  modules: [AnalyticsModule],
});
```

### Both in bundle and page component

You can use modules in both the bundle and the page component simultaneously. Bundle modules register first, then page component modules after the lazy component resolves:

```tsx
const CatalogPage: PageComponent = () => {
  /* ... */
};
CatalogPage.modules = [PaymentModule];

export default createBundle({
  name: 'catalog',
  components: { 'catalog/CatalogPage': CatalogPage },
  modules: [AnalyticsModule],
});
```

### How it works

Modules registration happens after `bundle` and `pageComponent` loads.

Modules always register in the **root (SINGLETON) container**. `Scope.SINGLETON` providers are created once and shared across requests. `Scope.REQUEST` providers have their records in the root container, but `ChildContainer` creates instances per-request through the standard fallback mechanism. It means, you can't register different implementation of the same token for different pages.

Registered modules will be deduplicated by module name at `@tinkoff/dippy` level.

No additional preload mechanism is needed — module code is part of the page/bundle chunk, which is already preloaded through existing `bundleResource`/`flushFiles` and `@loadable` mechanisms.

### Limitations

#### Multi-tokens

`@tinkoff/dippy` freezes multi-token values after the first `get()` call. If a lazy module adds a provider to a multi-token that was already resolved (e.g. `COMBINE_REDUCERS`, which resolves at application start), **the new value will not appear**.

Recommended way to working with multi-tokens, especially if core Tramvai tokens is used (`RENDER_SLOTS`, `COMBINE_REDUCERS`) - do not provide it in lazy modules, prefer manual registration in correlated services (`RESOURCES_REGISTRY`, `DISPATCHER_TOKEN` and `DISPATCHER_CONTEXT_TOKEN`) on late command line stages.

#### Already resolved dependencies

If a singleton provider was resolved before a lazy module registers a provider for the same token, the new provider will not replace the existing cached value. Design lazy modules to provide **new** tokens, not override existing ones.

#### Command Line stages

At server-side, lazy modules resolved in [Router Guard](03-features/07-routing/05-hooks-and-guards.md).

It means, at server-side you can provide only `resolvePageDeps`, `generatePage` and `clear` commands.

At browser-side, you can provide `resolveUserDeps`, `resolvePageDeps`, `spaTransition` and `afterSpaTransition`.

Other commands will be ignored or will be executed in next requests/SPA-navigations.

### How to

#### Manual modules loading

For cases when route configuration comes from an external service and you need to load modules by string name, you can implement a custom Modules Registry.

##### Define the registry module

```tsx
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
      useFactory: ({ rootContainer, fetchWebpackStats }) => {
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
            if (!fetchWebpackStats) return [];

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
        // exists only server-side
        fetchWebpackStats: optional(FETCH_WEBPACK_STATS_TOKEN),
      },
    }),
  ],
});
```

- `load(names)` — dynamically imports module chunks in parallel, registers them in the root container
- `preload(names)` — returns `PageResource[]` for `<link rel="preload">` hints. Returns resources instead of registering them directly because the registry is `Scope.SINGLETON` while `RESOURCES_REGISTRY` is `Scope.REQUEST`
- `FETCH_WEBPACK_STATS_TOKEN` is server-only, so it must be `optional` — on the client `preload` returns `[]`

##### Register module loaders

The `webpackChunkName` magic comment must match the name used in `registry.add()`:

```tsx
provide({
  provide: commandLineListTokens.init,
  multi: true,
  useFactory: ({ registry }) =>
    function registerLazyModules() {
      registry.add(
        'payment',
        () => import(/* webpackChunkName: "payment" */ './modules/PaymentModule')
      );
      registry.add('cart', () => import(/* webpackChunkName: "cart" */ './modules/CartModule'));
    },
  deps: { registry: LAZY_MODULES_REGISTRY_TOKEN },
});
```

##### Load modules in a route guard

```tsx
import { ROUTER_GUARD_TOKEN } from '@tramvai/tokens-router';
import { RESOURCES_REGISTRY } from '@tramvai/tokens-render';

provide({
  provide: ROUTER_GUARD_TOKEN,
  multi: true,
  useFactory:
    ({ registry, resourcesRegistry }) =>
    async ({ to }) => {
      const moduleNames = to.config.modules?.split(',').map((s) => s.trim());
      if (!moduleNames?.length) return;

      await registry.load(moduleNames);

      if (resourcesRegistry) {
        const resources = await registry.preload(moduleNames);
        resources.forEach((r) => resourcesRegistry.register(r));
      }
    },
  deps: {
    registry: LAZY_MODULES_REGISTRY_TOKEN,
    resourcesRegistry: optional(RESOURCES_REGISTRY),
  },
});
```

`RESOURCES_REGISTRY` must be `optional` — it is only available on the server. The guard calls `preload` only when it is present.

## Additional links

- About [DI container](concepts/di.md)
- About [providers](concepts/provider.md)
