---
id: page-render-mode
title: Page Render Mode
---

## Explanation

To be able to better handle high loads, `tramvai` provides a few additional page render modes, which allow the server to do less work when generating HTML - [static](#static-mode) and [client](#client-mode) modes.

### SSR mode

SSR mode - `ssr` - provides default `tramvai` behaviour, [render full page on server-side](03-features/010-rendering/01-ssr.md).

### Static mode

Static mode - `static` - in-memory cache for page HTML markup.

All requests for application pages will trigger background unpersonalized request for the same page, without query parameters and cookies, and result will be cached.

5xx responses will not be cached by default, but this behaviour are configurable.

Any responses from cache will have `X-Tramvai-Static-Page-From-Cache` header.

Additional metric with name `static_pages_cache_hit` will be added with cache hits counter.

Response from cache will be sent from `customer_start` command line, and next lines execution will be aborted.

Cache will be segmented by cache key (customizable via `STATIC_PAGES_KEY_TOKEN`) and route `pathname`.

Only headers from whitelist will be cached and sended with response ((customizable via `STATIC_PAGES_OPTIONS_TOKEN`)).

![Diagram](/img/features/rendering/static-mode.drawio.svg)

### Client mode

Client mode - `client` - render only fallback for page component, then render full page on browser, after hydration.

This mode can significally improve server rendering performance, but not recommended for pages with high SEO impact.

By default, [Header and Footer](03-features/04-layouts.md#header-and-footer) will be rendered as usual.

## Usage

### Installation

If you want to change between different rendering modes, you need to install `@tramvai/module-page-render-mode`. By default, this module connection has no changes, because default rendering mode is `ssr`. You can change this mode for all pages or for specific pages only.

```bash
npx tramvai add @tramvai/module-page-render-mode
```

And connect in the project

```tsx
import { createApp } from '@tramvai/core';
import { PageRenderModeModule } from '@tramvai/module-page-render-mode';

createApp({
  name: 'tincoin',
  modules: [PageRenderModeModule],
});
```

### Configuration

Default rendering mode is `ssr` for all pages.

#### Default mode

For changing global rendering mode use token `TRAMVAI_RENDER_MODE` from `@tramvai/tokens-render`:

```ts
import { TRAMVAI_RENDER_MODE } from '@tramvai/tokens-render';

const provider = {
  provide: TRAMVAI_RENDER_MODE,
  useValue: 'client',
};
```

#### Page-level mode

For specific pages available two options:

- setting mode in page component static property:

  ```tsx
  const PageComponent = () => <div>Page</div>;

  PageComponent.renderMode = 'client';

  export default PageComponent;
  ```

- setting mode in route config:

  ```ts
  const routes = [
    {
      name: 'main',
      path: '/',
      config: {
        pageComponent: '@/pages/index',
        pageRenderMode: 'client',
      },
    },
  ];
  ```

### Client mode fallback

Standard behaviour for SPA applications - render some fallback with spinner or page skeleton before application was rendered. You can set default fallback for all pages with `client` render mode, or only for specific pages.

#### Default fallback

For setting default fallback, use token `PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT`:

```tsx
import { PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT } from '@tramvai/module-page-render-mode';

const DefaultFallback = () => <div>Loading...</div>;

const provider = {
  provide: PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,
  useValue: DefaultFallback,
};
```

#### Page-level fallback

For specific pages available few options:

- add fallback to page component static property, use name `pageRenderFallbackDefault`:

  ```tsx
  import { PageComponent } from '@tramvai/react';

  const Page: PageComponent = () => <div>Page</div>;

  const PageFallback = () => <div>Loading...</div>;

  Page.components = {
    pageRenderFallbackDefault: PageFallback,
  };

  export default Page;
  ```

- and you can add fallback in route config, use key `pageRenderFallbackComponent` with any fallback name you provided in bundle or page component:

  ```ts
  const routes = [
    {
      name: 'main',
      path: '/',
      config: {
        pageComponent: '@/pages/index',
        pageRenderFallbackComponent: '@/pages/fallback',
      },
    },
  ];
  ```

### Static mode - in-memory cache

By default, `static` mode uses in-memory cache for pages. You can configure this cache with `STATIC_PAGES_OPTIONS_TOKEN`:

- `ttl` parameter spicified page response cache time. Default - `300000` ms (5 minutes).
- `maxSize` parameter spicified maximum cached urls count. Default - `100`. For apps with heavy HTML and a lot of urls memory usage can be increased significantly.
- `allowStale` parameter spicified if stale cache entries can be returned from LRU-cache

```ts
const provider = {
  provide: STATIC_PAGES_OPTIONS_TOKEN,
  useValue: {
    ttl: 5 * 60 * 1000,
    maxSize: 100,
  },
};
```

### Static mode - file-system cache

In-memory cache is fast, but can significantly increase memory usage for applications. To solve this problem, you can enable file-system cache as a second level of caching for static pages:

```ts
import { STATIC_PAGES_FS_CACHE_ENABLED } from '@tramvai/module-page-render-mode';

const provider = provide({
  provide: STATIC_PAGES_FS_CACHE_ENABLED,
  useValue: () => true,
});
```

When a request comes in, for `static` mode pages, the caching mechanism will work as follows:

1. check in-memory cache first (L1)
1. if not found or stale, check file-system cache (L2)
1. if found in FS cache, populate memory cache and serve
1. if not found anywhere, generate page and save to both caches
1. both caches implement Last Recently Used (LRU) eviction policy

#### Configuration

You can configure file-system cache using `STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN`:

- `ttl` parameter spicified page response cache time. Default - `300000` ms (5 minutes).
- `maxSize` parameter spicified maximum cached urls count. Default - `1000`. For apps with heavy HTML and a lot of urls memory usage can be increased significantly.
- `allowStale` parameter spicified if stale cache entries can be returned from LRU-cache
- `directory` parameter specified directory for cache storage. Default - `dist/static`.

```ts
import { STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN } from '@tramvai/module-page-render-mode';

const provider = {
  provide: STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN,
  useValue: {
    directory: 'dist/static',
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    allowStale: true,
  },
};
```

#### Metrics

Additional metrics are available for monitoring file-system cache:

- `static_pages_fs_cache_hit` - Total pages served from FS cache
- `static_pages_fs_cache_miss` - Total pages not found in FS cache
- `static_pages_fs_cache_size` - Current number of files in cache
- `static_pages_fs_cache_bytes` - Total size of cached files in bytes

#### SSG (prerendering) integration

When you run `tramvai static`, generated HTML files are automatically picked up by the file-system cache on application startup. This means that pre-generated pages are instantly available to respond for requests for static mode pages after deployment, without the need for background generation.

Here is a problem - env variables is injected in generate HTML pages, and this prerendered files can't be used for defferent environments by 12 Factor Apps.

To solve this problem, you can run `tramvai static` in Dockerfile before application startup, which means that all `node_modules` should be installed or copied before into Docker image.

Example CI setup for SSG with file-system cache for `static` mode:

1. Run `tramvai build ${appName}`
1. Run `tramvai static ${appName} --buildType none`
1. Modify `Dockerfil` to copy generated static files from `dist/static` directory to the image:

   ```dockerfile
   FROM node:24-buster-slim
   WORKDIR /app
   COPY dist/server /app/
   COPY package.json /app/
   ENV NODE_ENV='production'

   EXPOSE 3000
   CMD [ "node", "--max-http-header-size=80000", "/app/server.js" ]
   ```

## How-to

### How to prevent Header and Footer Rendering

By default, Header and Footer will be rendered as usual, because this module provide Page component wrapper. If you want to make less work on server, use token `PAGE_RENDER_WRAPPER_TYPE` with `layout` or `content` value, e.g.:

```ts
const providers = [
  {
    provide: PAGE_RENDER_WRAPPER_TYPE,
    useValue: 'layout',
  },
];
```

With `client` rendering mode, all layout will be rendered in browser.

`PAGE_RENDER_WRAPPER_TYPE` value will be passed to [default layout](references/modules/render.md#basic-layout), where the library [@tinkoff/layout-factory](references/libs/tinkoff-layout.md#wrappers) is used.

### How to clear static page cache

If you want to clear all cache, make POST request to special papi endpoint without body - `/{appName}/private/papi/revalidate/`.

For specific page, just add `pathname` parameter to request body, e.g. for `/static/` - `{ "pathname": "/static/" }` - and all variations will be cleared.

For specific page variation, add both `pathname` and `key` parameters to request body, e.g. for mobile version of `/static/` - `{ "pathname": "/static/", "key": "mobile" }`.

### How to customize cache key for different page variations

By default, the cache is segmented by page path and device type (mobile/desktop). You can customize this behavior using `STATIC_PAGES_KEY_TOKEN`:

```ts
import { STATIC_PAGES_KEY_TOKEN } from '@tramvai/module-page-render-mode';
import { USER_AGENT_TOKEN } from '@tramvai/module-client-hints';

const provider = [
  provide({
    provide: STATIC_PAGES_KEY_TOKEN,
    useFactory: ({ userAgent }) => {
      return () => {
        // Custom logic for cache key
        // Return empty string for desktop, 'mobile' for mobile devices
        return userAgent.device.type === 'mobile' ? 'mobile' : '';
      };
    },
    deps: {
      userAgent: USER_AGENT_TOKEN,
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
];
```

The cache key is combined with the pathname to create the full cache key. For example, internal cache keys will look like this:

- Desktop: `/about/` (key is empty string)
- Mobile: `/about/^mobile` (key is 'mobile')

`STATIC_PAGES_KEY_TOKEN` returned value will be used for [prerendering with different page variations](03-features/010-rendering/04-ssg.md#page-variations).

### How to disable background requests for static pages

For example, you want to cache only requests without cookies, without extra requests into the application:

```ts
const provider = {
  provide: STATIC_PAGES_BACKGROUND_FETCH_ENABLED,
  useValue: () => false,
};
```

### How to enable 5xx requests caching for static pages

For example, if 5xx responses are expected behaviour:

```ts
const provider = {
  provide: STATIC_PAGES_CACHE_5xx_RESPONSE,
  useValue: () => true,
};
```

### How to change page render mode at runtime

You can provide function to `TRAMVAI_RENDER_MODE` token:

```ts
const provider = {
  provide: TRAMVAI_RENDER_MODE,
  useFactory: ({ cookieManager }) => {
    return () => (cookieManager.get('some-auth-cookie') ? 'client' : 'ssr');
  },
  deps: {
    cookieManager: COOKIE_MANAGER_TOKEN,
  },
};
```

### How to change Cache-Control header for static pages

By default, `Cache-Control` header for static pages is `public, max-age={ttl / 1000}` and `private, no-cache, no-store, max-age=0, must-revalidate` in development mode, and you can change it with `STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN`:

```ts
const provider = provide({
  provide: STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN,
  // `ttl` and `updatedAt` has values in milliseconds
  useValue: ({ ttl, updatedAt }) => {
    // for better development experience, disable cache in development mode
    if (process.env.NODE_ENV === 'development') {
      return 'private, no-cache, no-store, max-age=0, must-revalidate';
    }

    // for example, if you want to reuse stale cache for 24 hours, add `stale-while-revalidate` directive
    return `public, max-age=${ttl / 1000}, stale-while-revalidate=86400`;
  },
});
```

## Troubleshooting

### Fallback name conflicts

You might get a potential conflict between existing components and render fallback component names - `pageRenderFallbackComponent` and `pageRenderFallbackDefault`. To avoid these issues, just change fallback name prefix using token `PAGE_RENDER_FALLBACK_COMPONENT_PREFIX`:

```ts
import { PAGE_RENDER_FALLBACK_COMPONENT_PREFIX } from '@tramvai/module-page-render-mode';

const provider = {
  provide: PAGE_RENDER_FALLBACK_COMPONENT_PREFIX,
  useValue: 'myOwnRenderFallback',
};
```
