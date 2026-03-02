---
title: Incremental Static Regeneration
---

Tramvai provides support for [Incremental Static Regeneration (ISR)](https://www.patterns.dev/react/incremental-static-rendering/) pattern for your application, which combines the following features:

- [Static Site Generation (SSG)](03-features/010-rendering/04-ssg.md) in build-time
- [Pages caching and regeneration](03-features/010-rendering/02-page-render-mode.md#static-mode) in runtime
- `Cache-Control` header for caching the page in CDN or browser level

## Explanation

Tramvai ISR implementation provides a three-level caching mechanism for your `static` pages:

1. In-memory cache
2. File-system cache
3. CDN or browser cache (via `Cache-Control` header)

Main benefit of ISR is that it allows you to prerender some popular pages at build time, and revalidate them in runtime, without the need to rebuild the entire application, and still have the benefits of pages caching.

It means for application developers:

- faster builds and deploys, since you don't need to prerender all pages
- better throughput and performance, since popular pages are cached and application spend less CPU time on rendering them

For application users it means:

- faster page loads
- fresh content depending on the ttl time you set for the page

## Usage

1. Install `@tramvai/module-page-render-mode` module:

   ```bash
   npx tramvai add @tramvai/module-page-render-mode
   ```

   And connect in the project

   ```tsx
   import { createApp } from '@tramvai/core';
   import { PageRenderModeModule } from '@tramvai/module-page-render-mode';

   createApp({
     name: 'my-app',
     modules: [PageRenderModeModule],
   });
   ```

1. Provide default page render mode as `static`:

   ```ts
   import { TRAMVAI_RENDER_MODE } from '@tramvai/tokens-render';

   const provider = provide({
     provide: TRAMVAI_RENDER_MODE,
     useValue: 'static',
   });
   ```

   Or set it for a specific page in [route config or component properties](03-features/010-rendering/02-page-render-mode.md#page-level-mode).

1. Enable file-system cache for pages:

   ```ts
   import { STATIC_PAGES_FS_CACHE_ENABLED } from '@tramvai/module-page-render-mode';

   const provider = provide({
     provide: STATIC_PAGES_FS_CACHE_ENABLED,
     useValue: () => true,
   });
   ```

1. Update `Dockerfile` to copy `dist/static` directory with cached pages:

   ```dockerfile
   FROM node:24-buster-slim
   WORKDIR /app
   COPY dist/server /app/
   COPY package.json /app/
   ENV NODE_ENV='production'

   EXPOSE 3000
   CMD [ "node", "--max-http-header-size=80000", "/app/server.js" ]
   ```

After that, all application pages will be served from cache, and will be revalidated in runtime with the default ttl of 5 minutes.

Static pages will have `X-Tramvai-Static-Page-From-Cache` response header, as indication that page was served from cache.

More details about page caching configuration and advanced patterns you can find in [Page render mode documentation](03-features/010-rendering/02-page-render-mode.md#static-mode).
