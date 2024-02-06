---
id: routing
title: Working with Url
---

## Explanation

Routing is configured and controlled by the Root App, Child App has a limited set of capabilities to work with `tramvai` router.

Child App has access to `tramvai` router through DI and can make navigations or subscribe to route changes in React components, but it can't add additional routes in the application.

## Usage

### Installation

First, you need to install `@tramvai/module-router` module and `@tramvai/tokens-router` in your Child App:

```bash
npx tramvai add @tramvai/module-router
npx tramvai add @tramvai/tokens-router
```

Then, connect `RouterChildAppModule` from this module in your `createChildApp` function:

```ts
import { createChildApp } from '@tramvai/child-app-core';
import { RouterChildAppModule } from '@tramvai/module-router';
import { RootCmp } from './components/root';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'fancy-child',
  render: RootCmp,
  modules: [RouterChildAppModule],
  providers: [],
});
```

### Make navigations

Simplest way to make navigations in Child App is to use [`<Link />` component](03-features/07-routing/04-links-and-navigation.md#link-component).

Another way is to use [PAGE_SERVICE_TOKEN](03-features/07-routing/04-links-and-navigation.md#pageservice-service) token from Root App, for example you can use it in React components directly with `useDi`, let's make navigation to `/another-page/`:

```tsx title="components/root.tsx"
import { useDi } from '@tramvai/react';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

export const RootCmp = () => {
  const pageService = useDi(PAGE_SERVICE_TOKEN);
  const navigate = () => pageService.navigate('/another-page/');

  return (
    <button onClick={navigate}>Navigate to /another-page/</button>
  );
};
```

### Update current route

`PAGE_SERVICE_TOKEN` is also used to update current route without navigation. We already use it directly in React component, let's try Actions now, for example we will add a `myOwnQuery` query parameter:

```tsx title="components/root.tsx"
import { declareAction } from '@tramvai/core';
import { useActions } from '@tramvai/state';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

const updateQueryAction = declareAction({
  name: 'update-query',
  async fn(value: string) {
    // highlight-next-line
    return this.deps.pageService.updateCurrentRoute({ query: { myOwnQuery: value } });
  },
  deps: {
    pageService: PAGE_SERVICE_TOKEN,
  },
});

export const RootCmp = () => {
  // highlight-next-line
  const updateQuery = useActions(updateQueryAction);
  const handleUpdate = () => updateQuery('some value');

  return (
    <>
      <button onClick={handleUpdate}>add myOwnQuery query parameter</button>
    </>
  );
};
```

### Subscribe to route changes

[`useRoute` and `useUrl` hooks](03-features/07-routing/03-working-with-url.md) is available to use in Child App for subscriptions to route changes:

```tsx title="components/root.tsx"
import { useRoute } from '@tramvai/module-router';

export const RootCmp = () => {
  const route = useRoute();

  return <div>Route path: {route.actualPath}</div>;
};
```

### Multi-page Child Apps

:::warning

Experimental and unstable, public API can be changed in the future.

[File-System Routing](03-features/03-pages.md#file-system-routing) is not supported yet.

:::

For a complex features, you may want to have one Child App, which can be rendered in multiple pages.

Child Apps support pages with a limited set of features:
- [`lazy` component from `@tramvai/react`](references/tramvai/react.md)
- Unique list of actions for every page
- Code-splitting by [granular](https://web.dev/granular-chunking-nextjs/) strategy
- Preloading for pages for specific routes

Application routing still declared and configured in Root Application.

#### Application

:hourglass: At first, you need to declare routes in Root App with `unstable_childAppPageComponent` property, e.g.:

```ts
const routes = [
  {
    name: 'lazy-foo',
    path: '/lazy/foo',
    config: {
      pageComponent: '@/pages/LazyPage',
      unstable_childAppPageComponent: 'FooCmp',
    },
  },
  {
    name: 'lazy-bar',
    path: '/lazy/bar',
    config: {
      pageComponent: '@/pages/LazyPage',
      unstable_childAppPageComponent: 'BarCmp',
    },
  },
];
```

:hourglass: The same Child App will be used in a page component on both routes:

```tsx title="app/src/pages/LazyPage.tsx"
import type { PageComponent } from '@tramvai/react';
import { ChildApp } from '@tramvai/module-child-app';

export const LazyPage: PageComponent = () => {
  return (
    <>
      <ChildApp name="lazy" />
    </>
  );
};

LazyPage.childApps = [{ name: 'lazy' }];

export default LazyPage;
```

### Child App

:hourglass: In Child App UI component you need to use `children` property, where current page component will be passed:

```tsx title="child-app/src/components/root.tsx"
import type { PropsWithChildren } from 'react';

export const RootCmp = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <h1>Lazy Child App</h1>

      {children}
    </>
  )
};
```

:hourglass: Also you need to create all required page components, e.g.:

```tsx title="child-app/src/components/foo.tsx"
import { declareAction } from '@tramvai/core';

const fooPageAction = declareAction({
  name: 'foo-page-action',
  async fn() {
    // do something
  },
});

export const FooCmp = () => {
  return (
    <>
      <h2>Foo Page</h2>
    </>
  )
};

FooCmp.actions = [fooPageAction];

export default FooCmp;
```

:hourglass: Then, you need to register all components in Child App through `CHILD_APP_PAGE_COMPONENTS_TOKEN`:

```ts title="child-app/src/index.ts"
import { provide } from '@tramvai/core';
import { createChildApp } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { CHILD_APP_PAGE_COMPONENTS_TOKEN } from '@tramvai/tokens-child-app';
import { lazy } from '@tramvai/react';
import { RouterChildAppModule } from '@tramvai/module-router';
import { RootCmp } from './components/root';

// declare lazy components for code-splitting
const FooCmp = lazy(() => import('./components/foo'));
const BarCmp = lazy(() => import('./components/bar'));

export default createChildApp({
  name: 'lazy',
  render: RootCmp,
  // provide required modules
  modules: [CommonChildAppModule, RouterChildAppModule],
  providers: [
    provide({
      provide: CHILD_APP_PAGE_COMPONENTS_TOKEN,
      // the same keys as in App routes list in `unstable_childAppPageComponent` properties
      useValue: {
        FooCmp,
        BarCmp,
      },
    }),
  ],
});
```

Thats all! In `/lazy/foo` or `/lazy/bar` route you will see `FooCmp` or `BarCmp` component respectively, and only specific actions will be executed.
