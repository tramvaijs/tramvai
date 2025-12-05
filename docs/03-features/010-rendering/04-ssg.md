---
id: ssg
title: Static-Site Generation
---

`tramvai` can generate pages of your application at build time to static HTML files, this feature is usually called [Static Site Generation (SSG)](https://www.patterns.dev/posts/static-rendering/)

## Explanation

`tramvai static <appName>` command run production build of the application, then starts application server, and make requests to all application routes. All responses are saved to `.html` files inside `dist/static` directory.

This feature is suitable for applications where all pages are independent of dynamic server-side data. You can serve generated HTML files without `tramvai` server by CDN or any static server.

## Usage

### Development

1. Run development build as usual:

   ```bash
   tramvai start <appName>
   ```

1. Open server with exported pages at http://localhost:3000/

### Production build

1. Run SSG command:

   ```bash
   tramvai static <appName>
   ```

1. Deploy HTML pages to your server and static assets to your CDN

### Preview pages

1. Run SSG command with `--serve` flag:

   ```bash
   tramvai static <appName> --serve
   ```

1. Open server with exported pages at http://localhost:3000/

### Static Assets

All static resources (js, css files) will be loaded according to the url specified in `ASSETS_PREFIX` env variable.

If you build HTML pages with static prefix, for example `ASSETS_PREFIX=https://your.cdn.com/`, this variable injecting in HTML in build time, and you can't change `ASSETS_PREFIX` in deploy time.

### Routes with dynamic parameters

For example, you have this file-system routes structure:

```
src
└── routes
    ├── index.tsx
    └── blog
      ├── index.tsx
      └── [id]
        └── index.tsx
```

Corresponding routes will be:
- `/`
- `/blog/`
- `/blog/:id/`

By default, `tramvai static` will generate HTML only for `/` and `/blog/` routes, and ignore dynamic `/blog/:id/`:
- `dist/static/index.html`
- `dist/static/blog/index.html`

If you want to generate HTML for dynamic routes, at server-side, you need to register `prerender:routes` hook for `PRERENDER_HOOKS_TOKEN` token:

```ts
import { PRERENDER_HOOKS_TOKEN } from '@tramvai/tokens-router';

const provider = provide({
   provide: commandLineListTokens.listen,
   useFactory: ({ hooks, httpClient }) => {
      return async function addPrerenderRoutes() {
         hooks['prerender:routes'].tapPromise('MyBlogPrerenderRoutesPlugin', async (_, routes) => {
            // Fetch posts from your API, e.g. response will be: `[{ id: 1 }, { id: 2 }, { id: 3 }]`
            const posts = httpClient.get('/posts');

            // Add routes for each post, so HTML will be generated for `/blog/1/`, `/blog/2/` and `/blog/3/`
            posts.forEach((post) => {
               routes.push(`/blog/${post.id}/`);
            });
         });
      };
   },
   deps: {
      hooks: PRERENDER_HOOKS_TOKEN,
      httpClient: MY_BLOG_API_HTTP_CLIENT_TOKEN,
   },
});
```

### Filtering routes from prerendering

For example, you have this routes list:
- `/`
- `/foo/`
- `/bar/`
- `/secret/`

And if you want to exclude `/secret/` route from prerendering, you can use `prerender:generate`  hook for `PRERENDER_HOOKS_TOKEN` token:

```ts
import { PRERENDER_HOOKS_TOKEN } from '@tramvai/tokens-router';

const provider = provide({
   provide: commandLineListTokens.listen,
   useFactory: ({ hooks, httpClient }) => {
      return async function filterPrerenderRoutes() {
         hooks['prerender:generate'].tapPromise('MyFilterPrerenderRoutesPlugin', async (_, route) => {
            // First, match the route path
            if (route.actualPath.includes('/secret')) {
               // Than mark it as skipped
               route.prerenderSkip = true;
            }
         });
      };
   },
   deps: {
      hooks: PRERENDER_HOOKS_TOKEN,
      httpClient: MY_BLOG_API_HTTP_CLIENT_TOKEN,
   },
});
```

### Select pages to build

You can specify the comma separated paths list for static HTML generation with `--onlyPages` flag:

```bash
tramvai static <appName> --onlyPages=/about/,/blog/
```

### Custom page request headers

You can specify HTTP headers for pages requests with `--headers` flag, for example if you need generate different HTML for devices with mobile User-Agent:

```bash
tramvai static <appName> --header "User-Agent: ..."
```

This can be combined with `--folder` flag, which allows to generate different HTML files in subfolder and prevent conflicts:

```bash
tramvai static <appName> --header "User-Agent: ..." --folder "mobile"
```

HTML pages will be generated in `dist/static/mobile` folder.

## Limitations

Server-side [Application Lifecycle](03-features/06-app-lifecycle.md) and [Navigation Flow](03-features/07-routing/02-navigation-flow.md#server-navigation) will be executed only once at build time. It means than some data will be non-existed, empty or outdated, for example `User-Agent` will not be parsed.
