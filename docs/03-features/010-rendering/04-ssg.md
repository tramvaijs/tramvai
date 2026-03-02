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
import { PRERENDER_HOOKS_TOKEN } from '@tramvai/module-router';

const provider = provide({
  provide: commandLineListTokens.listen,
  useFactory: ({ hooks, httpClient }) => {
    return async function addPrerenderRoutes() {
      hooks['prerender:routes'].tapPromise('MyBlogPrerenderRoutesPlugin', async (_, routes) => {
        // Fetch posts from your API, e.g. response will be: `[{ id: 1 }, { id: 2 }, { id: 3 }]`
        const posts = await httpClient.get('/posts');

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

And if you want to exclude `/secret/` route from prerendering, you can use `prerender:generate` hook for `PRERENDER_HOOKS_TOKEN` token:

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

### Page variations

:::warning

Variations will work only for routes with [`static` page render mode](#integration-with-static-page-render-mode)

:::

Sometimes you need to generate different variations of the same page (e.g., `desktop` and `mobile` versions), you can achieve this by providing `PrerenderRequest` objects in the `prerender:routes` hook, where key will be generated from `STATIC_PAGES_KEY_TOKEN`, then used as part of generated HTML files names, e.g.:

```ts
import { PRERENDER_HOOKS_TOKEN } from '@tramvai/module-router';

const providers = [
  provide({
    provide: STATIC_PAGES_KEY_TOKEN,
    useFactory: ({ userAgent, requestManager }) => {
      return () => {
        const { query } = requestManager.getParsedUrl();
        const isMobile = userAgent.device.type === 'mobile';

        if (query.utm_source && query.utm_medium) {
          return 'promo';
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
  provide({
    provide: commandLineListTokens.listen,
    useFactory: ({ hooks }) => {
      return async function addPrerenderVariations() {
        hooks['prerender:routes'].tapPromise('MyPrerenderVariationsPlugin', async (_, routes) => {
          // Desktop variation
          routes.push({
            pathname: '/products/',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          // Mobile variation
          routes.push({
            pathname: '/products/',
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
            },
          });

          // Variation with query parameters
          routes.push({
            pathname: '/products/',
            query: {
              utm_source: 'email',
              utm_campaign: 'summer',
            },
          });
        });
      };
    },
    deps: {
      hooks: PRERENDER_HOOKS_TOKEN,
    },
  }),
];
```

This will generate:

- `dist/static/products/index.desktop.html`
- `dist/static/products/index.mobile.html`
- `dist/static/products/index.promo.html`

### Integration with Static Page Render Mode

When using `@tramvai/module-page-render-mode` with `static` render mode, pre-generated HTML files are automatically integrated with the runtime file-system cache:

1. `tramvai static` generates HTML files in `dist/static`
1. application scans `dist/static` and indexes all files
1. requests are served from file-system cache immediately
1. missing pages are generated and added to cache in runtime

See [file-system cache documentation](03-features/010-rendering/02-page-render-mode.md#static-mode---file-system-cache) for more details.

### Select pages to build

You can specify the comma separated paths list for static HTML generation with `--onlyPages` flag:

```bash
tramvai static <appName> --onlyPages=/about/,/blog/
```

### Custom page request headers

```warning

Deprecated feature, use `prerender:routes` hook to specify custom headers for page requests, see [Page variations](#page-variations) section for details.

```

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
