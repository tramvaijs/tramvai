---
id: overview
title: Overview
---

## Features

- Router works both on the server and on the client
- [File-System Routing](03-features/03-pages.md#file-system-routing)
- Transition options: with or without SPA
- [Router Guards](03-features/07-routing/05-hooks-and-guards.md) to check the availability of a route under specific conditions
- Subscriptions to different stages of the transition through [Router Hooks](03-features/07-routing/05-hooks-and-guards.md)
- React integration by [components and hooks](03-features/07-routing/04-links-and-navigation.md)
- Support for [View Transitions API](03-features/07-routing/11-view-transitions.md)

### Client routing with/without SPA transitions

By default, `tramvai` application is a combination of SSR and SPA approaches - at first request HTML page will be rendered server-side, then any in-app navigations on client-side will be SPA transitions. `SpaRouterModule` responsible for this behaviour:

```tsx
import { createApp } from '@tramvai/core';
import { SpaRouterModule } from '@tramvai/module-router';

createApp({
  name: 'awesome-app',
  modules: [SpaRouterModule],
});
```

Meanwhile, `tramvai` application easily can be transformed to multi-page app **without** SPA transitions, with `NoSpaRouterModule`:

```tsx
import { createApp } from '@tramvai/core';
import { NoSpaRouterModule } from '@tramvai/module-router';

createApp({
  name: 'awesome-app',
  modules: [NoSpaRouterModule],
});
```

### Navigation Lifecycle

Information about navigation lifecycle is available on [Navigation Flow page](03-features/07-routing/02-navigation-flow.md)

### Route and Url

Information about Route and Url is available on [Working with Url page](03-features/07-routing/03-working-with-url.md)

:::note

Worth noting, that `tramvai` router doesn't have the concept of [Base Name](https://reactrouter.com/en/main/router-components/memory-router#basename), [Base Path](https://nextjs.org/docs/app/api-reference/next-config-js/basePath) or similar.

That's why you need to always set up paths for your routes as they presented on the balancer. For instance, if your app was hosted to `https://some-company.com/some-app` all of your routes must reflect it on their paths:

```typescript
[
  {
    path: '/some-app/',
    name: 'root',
  },
  {
    path: '/some-app/login/',
    name: 'login',
  },
  {
    path: '/some-app/dashboard/',
    name: 'dashboard',
  },
];
```

### Trailing Slash

Router will force all urls to end with slash, e.g. `/foo` path will be redirected to `/foo/`.

### Merge Slashes

Router will replace several consecutive slashes by single slashes (slashes after protocol are still be with `//` after protocol name), e.g. `/foo///bar/` path will be redirected to `/foo/bar/`.
