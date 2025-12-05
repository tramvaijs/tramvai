# Cache warmup

Module to execute warmup of the cache when app starts.

## Installation

By default, the module is already included in `@tramvai/module-server` and no additional actions are needed.

```tsx
import { createApp } from '@tramvai/core';
import { CacheWarmupModule } from '@tramvai/module-cache-warmup';

createApp({
  modules: [CacheWarmupModule],
});
```

## Explanation

> Module is executed only when `NODE_ENV === production`.

1. When app starts the module will request list of app urls from papi-route `prerenderRoutes`.
2. For every url from the response it sends two requests: one for mobile and one for desktop device. But only `1` requests are running simultaneously in total.
3. Routes with dynamic parameters, like `/blog/:id/`, will be skipped by default

### Routes with dynamic parameters

For example, you want to warmp up dynamic routes like `/blog/1/`, `/blog/2/` and `/blog/3/`. CacheWarmupModule will use the same urls list as `tramvai static` command, so you need to use the same mechanism - [custom `prerender:routes` hook](03-features/010-rendering/04-ssg.md#routes-with-dynamic-parameters).

### Filtering routes from warmup

If you want to exclude some routes from warmup, you can use `cache-warmup:request` hook for `CACHE_WARMUP_HOOKS_TOKEN` token:

```ts
const provider = provide({
  provide: commandLineListTokens.listen,
  useFactory: ({ hooks, logger }) => {
    return async function filterWarmupRoutes() {
      hooks['cache-warmup:request'].wrap(async (_, payload, next) => {
        // Match request url or any other parameters, and skip it
        if (payload.parameters.url?.includes('/some-unpopular-and-heavy-page')) {
          return {
            parameters: payload.parameters,
            result: 'skipped',
          };
        }
        // Otherwise, continue with the request
        return next(payload);
      });
    };
  },
  deps: {
    hooks: CACHE_WARMUP_HOOKS_TOKEN,
    logger: LOGGER_TOKEN,
  },
});
```

### User-agent

In order to emulate mobile or desktop device next user-agent strings are used:

```js
[
  /** Chrome on Mac OS */
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
  /**  Chrome on Mobile */
  'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
];
```

## Debug

This module logs with id `cache-warmup`

## How to

### How to disable cache warmup?

Run application with env variable `CACHE_WARMUP_DISABLED=true` to prevent cache warmup in local or testing environments.
