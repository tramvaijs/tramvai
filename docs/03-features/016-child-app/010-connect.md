---
id: connect
title: Connect Child App and Root App
---

For now, we have a new shiny Child App, with perfect UI and all possible features like Actions, modules and providers, stores, commands, etc. Next, we need to connect it with Root App.

## Installation

First, you need to install `@tramvai/module-child-app` module in your Root App:

```bash
npx tramvai add @tramvai/module-child-app
```

Then, connect `RouterChildAppModule` from this module in your `createApp` function:

```ts
import { createApp } from '@tramvai/core';
import { ChildAppModule } from '@tramvai/module-child-app';

createApp({
  name: 'tincoin',
  modules: [ChildAppModule],
});
```

## Configuration

At first, we need to provide a **complete map** of Child Apps and their versions, which will be used in our Root App. This can be done with `CHILD_APP_RESOLUTION_CONFIGS_TOKEN` token.

Also, we need to provide a **base url** for Child Apps assets, which will be used in our Root App. This can be done with `CHILD_APP_RESOLVE_BASE_URL_TOKEN` token or [few other methods](#base-url).

For example, our Root App has one Child App - `fancy-child`, resolution config will look like this:

```ts
import { createApp, provide } from '@tramvai/core';
import {
  ChildAppModule,
  CHILD_APP_RESOLVE_BASE_URL_TOKEN,
  CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
} from '@tramvai/module-child-app';

createApp({
  name: 'tincoin',
  modules: [ChildAppModule],
  providers: [
    provide({
      provide: CHILD_APP_RESOLVE_BASE_URL_TOKEN,
      useValue: 'https://my.cdn.dev/child-app/',
    }),
    provide({
      provide: CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
      useValue: [
        {
          // name of the child-app
          name: 'fancy-child',
          byTag: {
            latest: {
              // current version for the child app for tag `latest`
              version: '1.0.0',
              // remove this property if you already add CSS for this Child App
              withoutCss: true,
            },
          },
        },
      ],
    }),
  ],
});
```

:::tip

All benefits of microfrontends approach can be available if you will have remote configuration for Child Apps - because you will be able to release new Child Apps versions independend from Root App release cycle.

You can achieve this with **async** `CHILD_APP_RESOLUTION_CONFIGS_TOKEN` provider, where you can fetch configuration from remote API, s3 file storage, etc.

In this case, it is important to cache this requests for short time, because it will be executed on every page rendering.

:::

### Base URL

You can provide global base url for all Child Apps, and unique base url for any of Child Apps.

Global url can be provided with few methods:

- `CHILD_APP_RESOLVE_BASE_URL_TOKEN` provider in Root App code
- `CHILD_APP_EXTERNAL_URL` env variable, passed to Root App

Specific url can be provided in Child App configuration in `baseUrl` property:

```ts
const provider = provide({
  provide: CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
  useValue: [
    {
      name: 'fancy-child',
      byTag: {
        latest: {
          version: '1.0.0',
          withoutCss: true,
        },
      },
      // highlight-next-line
      baseUrl: 'https://my.cdn.dev/fancy-child/',
    },
  ],
});
```

## Rendering

We definitely want to render our Child App in one of Root App pages. For this, we need to use `<ChildApp />` component:

```tsx title="routes/index.tsx"
import type { PageComponent } from '@tramvai/react';
import { ChildApp } from '@tramvai/module-child-app';

const MainPage: PageComponent = () => {
  return (
    <>
      <h1>Main Page</h1>
      <ChildApp name="fancy-child" />
    </>
  );
};

export default MainPage;
```

## Preloading

By default, this Child App will be rendered only client-side, because we don't know about this microfrontend before started rendering page component server-side. It is not optimal for SEO, UX and performance, so we need to provide list of Child Apps for preloading. This can be done automatically or manually. The same logic is applied for running `spa` line list while transitioning by spa navigation on client - `spa` line list will be executed only for Child Apps that were preloaded on the next page of navigation.

:::tip

If you really need to render Child App client-side only, you can render `<ChildApp />` only when some state was changed on component mount in `useEffect` hook

:::

### Preload automatically for page or layout

You can provide list of Child Apps for preloading in `childApps` property of page or layout component:

```tsx title="routes/index.tsx"
import type { PageComponent } from '@tramvai/react';
import { ChildApp } from '@tramvai/module-child-app';

const MainPage: PageComponent = () => {
  return (
    <>
      <h1>Main Page</h1>
      <ChildApp name="fancy-child" />
    </>
  );
};

// highlight-next-line
MainPage.childApps = [{ name: 'fancy-child' }];

export default MainPage;
```

### Extend preload source list

You can provide additional source for Child Apps list, for example, to get it from some remote configuration.

Use token `CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN`:

```ts
import { provide } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';

const providers = [
  // hardcoded list of Child Apps
  provide({
    provide: CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
    useValue: ({ route }) => {
      if (route.path !== '/fancy-child/') {
        return [];
      }
      return [{ name: 'fancy-child' }];
    },
  }),
  // remote source of Child Apps
  provide({
    provide: CHILD_APP_PRELOAD_SOURCE_LIST_TOKEN,
    useFactory: ({ httpClient }) => {
      return async () => {
        const { payload } = await httpClient.get(`/some-child-app-list.json`);

        return payload;
      };
    },
    deps: {
      httpClient: HTTP_CLIENT_TOKEN,
    },
  }),
];
```

### Preload manually

:::warning

Use manual preload carefully:

- Preloaded Child App will be treated as used on current page and lifecycle for this Child App will be triggered
- Preloading will work properly in all cases (Child App actions, `spa` and `afterSpa` lines) only on `resolvePageDeps` command line, because internal `@tramvai/module-child-app` logic expect that all required Child Apps is already preloaded after
- For future navigations prefer [`preloadManager.prefetch`](#prefetch-manually) method instead of `preloadManager.preload`

:::

You can preload any child-app manually with the help of `CHILD_APP_PRELOAD_MANAGER_TOKEN`:

```ts
import { provide, commandLineListTokens } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';

const provider = provide({
  provide: commandLineListTokens.resolvePageDeps,
  useFactory: ({ preloadManager }) => {
    return function preloadFancyChildApp() {
      return preloadManager.preload({ name: 'fancy-child' });
    };
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
  },
});
```

If [Multi-page Child Apps](03-features/016-child-app/08-routing.md#multi-page-child-apps) is used, you need to provide current route to `preload` method:

```ts
import { provide, commandLineListTokens } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';
import type { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

const provider = provide({
  provide: commandLineListTokens.resolvePageDeps,
  useFactory: ({ preloadManager, pageService }) => {
    return function preloadFancyChildApp() {
      const route = pageService.getCurrentRoute();

      return preloadManager.preload({ name: 'fancy-child' }, route);
    };
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
    pageService: PAGE_SERVICE_TOKEN,
  },
});
```

### Prefetch manually

For future navigations you don't need to run Child Apps lifecycle, only load and cache static assets.

For that, you can reuse [`Link` component automatic prefetching](03-features/07-routing/04-links-and-navigation.md#page-resources-prefetch) with manually preloaded Child Apps:

```ts
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';
import { LINK_PREFETCH_HANDLER_TOKEN } from '@tramvai/tokens-router';

const provider = provide({
  provide: LINK_PREFETCH_HANDLER_TOKEN,
  useFactory: ({ preloadManager }) => {
    return function prefetchFancyChildApp(route) {
      return preloadManager.prefetch({ name: 'fancy-child' }, route);
    };
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
  },
});
```

## Development

By default, Child App assets in development mode will be served on `http://localhost:4040/`. Root App will use the same url in development mode and when Child App is passed in `CHILD_APP_DEBUG` env variable.

1. Run child-app using cli

   ```sh
   yarn tramvai start child-app
   ```

1. Run Root App with `CHILD_APP_DEBUG` environment variable

   ```sh
   CHILD_APP_DEBUG=child-app npx tramvai start root-app
   ```

### Multiple Child Apps

1. Run somehow multiple Child Apps. They should be started on different ports.

1. And either pass `Base Url` showed from `tramvai` CLI in terminal (after `start` command) as url to debug every Child App

   ```sh
   CHILD_APP_DEBUG=child-app1=baseUrl1;child-app2=baseUrl2 npx tramvai start root-app
   ```

1. Or implement proxy on default `http:://localhost:4040/` yourself which redirects to concrete server by url

   ```sh
   CHILD_APP_DEBUG=child-app1;child-app2 npx tramvai start root-app
   ```

### Custom debug configuration

You may specify a full config to debug to a specific Child App:

1. Provide token `CHILD_APP_RESOLUTION_CONFIGS_TOKEN` for needed Child Apps add special tag `debug`:

   ```ts
   const provider = provide({
     provide: CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
     useValue: [
       {
         name: 'fancy-child',
         byTag: {
           latest: {
             version: '1.0.0',
             withoutCss: true,
           },
           // highlight-start
           debug: {
             baseUrl: '...url',
             version: '...version',
             client: {},
             server: {},
             css: {},
           },
           // highlight-end
         },
       },
     ],
   });
   ```

1. Run Root App with `CHILD_APP_DEBUG` environment variable with value of Child App names needed to debug

## How to

### How to get current configuration for Child App

For example, you need to get Child App name and version. You can use token `CHILD_APP_INTERNAL_CONFIG_TOKEN` for it, e.g.:

```ts
import { provide } from '@tramvai/core';
import { createChildApp, commandLineListTokens } from '@tramvai/child-app-core';
import { CHILD_APP_INTERNAL_CONFIG_TOKEN } from '@tramvai/tokens-child-app';
import { CommonChildAppModule } from '@tramvai/module-common';
import { RootCmp } from './components/root';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'fancy-child',
  render: RootCmp,
  modules: [CommonChildAppModule],
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      useFactory: ({ analytics, config }) => {
        return function sendRenderEvent() {
          const { name, version } = config;

          analytics.send({ event: 'child-app-render', name, version });
        };
      },
      deps: {
        analytics: SOME_ANALYTICS_TOKEN,
        config: CHILD_APP_INTERNAL_CONFIG_TOKEN,
      },
    }),
  ],
});
```
