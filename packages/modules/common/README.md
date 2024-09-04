# Common

Base module consisted of the architectural blocks for typical tramvai app. This module is required at most cases and is used a lot by the other modules.

## Installation

First install `@tramvai/module-common`

```bash npm2yarn
npm i @tramvai/module-common
```

Add CommonModule to the modules list

```tsx
import { createApp } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';

createApp({
  modules: [CommonModule],
});
```

## Explanation

### Submodules

#### CommandModule

Module that adds implementation for the [commandLineRunner](concepts/command-line-runner.md) and defines default command lines

This module logs with id `command:command-line-runner`

#### StateModule

Adds state-manager

#### ActionModule

Implements [action system](concepts/action.md)

This module logs with id `action:action-page-runner`

#### CookieModule

Add providers that works with cookie. See [docs](references/modules/cookie.md)

#### EnvironmentModule

Implements work with environment variables both on server and client. See [docs](references/modules/env.md)

#### PubSub

Provides PubSub interface to implement communication between components. See [docs](references/libs/pubsub.md)

This modules logs with id `pubsub`

#### LogModule

Module for logging. Uses [`@tramvai/module-log`](references/modules/log.md)

#### CacheModule

Module that implements caches.

It provides next functionality:

- create new cache instance (instance of lru-cache by default)
- clear all of the previously create caches
- subscribe on cache clearance event to execute own cache clearance actions
- adds papi-route `/clear-cache` that will trigger caches clear event

This modules logs with id `cache:papi-clear-cache`

##### Cache types

You can create different cache types with `CREATE_CACHE_TOKEN` factory:

- LRU - [@tinkoff/lru-cache-nano](https://github.com/tramvaijs/lru-cache-nano)

  This type of cache is created by default. To create it explicitly you must pass `'memory'` as the first argument, and options as the second.

  ```typescript
  provide({
    provide: CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ createCache }) =>
      createCache('memory', {
        max: 100,
        ttl: 24 * 60 * 60 * 1000, // 1 day
        ttlResolution: 60 * 1000, // 1 minute
        allowStale: true,
        updateAgeOnGet: true,
      }),
    deps: {
      createCache: CREATE_CACHE_TOKEN,
    },
  });
  ```

- LFU - [@akashbabu/lfu-cache](https://github.com/AkashBabu/lfu-cache)

  To create it you must pass `'memory-lfu'` as the first argument, cache options - as second.

  ```typescript
  provide({
    provide: CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ createCache }) =>
      createCache('memory-lfu', {
        max: 20,
        evictCount: 5,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      }),
    deps: {
      createCache: CREATE_CACHE_TOKEN,
    },
  });
  ```

##### Cache metrics

To turn cache hit/miss rate monitoring, cache size, you need to provide cache name in options:

```typescript
provide({
  provide: CACHE_TOKEN,
  scope: Scope.SINGLETON,
  useFactory: ({ createCache }) =>
    createCache('memory', {
      name: 'cache-name',
    }),
  deps: {
    createCache: CREATE_CACHE_TOKEN,
  },
});
```

Cache name have to be unique, factory will throw exception in case of cache name duplication.

[Metric module](references/modules/metrics.md) should be provided in your application.

Server cache metrics:

- cache_hit{name, method} counter
- cache_miss{name, method} counter
- cache_max{name} gauge
- cache_size{name} gauge

By default hit/miss rate is computed as a sum of all data access attempts (methods `has`, `peek`, `get`).

#### RequestManagerModule

Wrapper for the client request

#### ResponseManagerModule

Wrapper for the client response

## How to

### Create cache

```tsx
import { provide } from '@tramvai/core';

export const providers = [
  provide({
    provide: MY_MODULE_PROVIDER_FACTORY,
    scope: Scope.SINGLETON,
    useFactory: ({ createCache }) => {
      const cache = createCache('memory', ...args); // type of the cache and any additional options that will be passed to the cache constructor

      return someFactory({ cache });
    },
    deps: {
      createCache: CREATE_CACHE_TOKEN,
    },
  }),

  provide({
    provide: REGISTER_CLEAR_CACHE_TOKEN,
    scope: Scope.SINGLETON,
    useFactory: ({ cache }) => {
      return async () => {
        await cache.reset();
        console.log('my module cache cleared');
      };
    },
    deps: {
      cache: MY_MODULE_CACHE,
    },
  }),

  provide({
    provide: commandLineListTokens.clear,
    useFactory: ({ clearCache }) => {
      return function clear() {
        clearCache(); // clear caches explicitly
      };
    },
    deps: {
      clearCache: CLEAR_CACHE_TOKEN,
    },
  }),
];
```

## Exported tokens

- [tokens-common](references/tokens/common.md)
- [cookie](references/modules/cookie.md)
- [env](references/modules/env.md)
