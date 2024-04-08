---
id: streaming-data
title: Streaming Data
---

:::caution

Experimental feature

:::

## Explanation

Imagine that you have a slow API call that returns a large amount of data, which is important to display to the user fast as possible, e.g. flight tickets or hotels search results.

Waiting for this data at server-side is not optimal, because user will see a blank page for a seconds. Usually, you will run this API call on the client-side, and results will be displayed very later, after this steps:
- page response finished
- static assets are loaded (JS, CSS)
- [hydration](03-features/010-rendering/03-hydration.md) is completed

This problem and possible solution is perfectly illustrated in the [remix.run](https://remix.run/docs/en/1.19.3/guides/streaming) documentation:

![Diagram](/img/features/data-fetching/data-fetching-client-vs-streaming.svg)

:::info

By the way, this feature is heavily inspired by the `Remix` framework `defer + Await` API and new `React 18` streaming capabilities!

:::

So, what is the Deferred Data Fetching and how it can solve the problem?

Thanks to the `renderToPipeableStream` and `Suspense` API's, and [Selective Hydration](https://www.patterns.dev/posts/react-selective-hydration/), we have the ability to run API call on the server-side without waiting for it before send application shell + loading indicator to the client. At client-side, loading indicator will be replaced when API call is finished, and results will be displayed and hydrated significantly faster.

### Deferred Data Fetching

For deferred data fetching, you need to use usual `tramvai` [Actions](03-features/09-data-fetching/01-action.md) with `deferred: true` property, we call it [Deferred Actions](#deferred-actions).

Main difference between regular Actions is that Deferred Actions are executed on the server-side without [timeout](03-features/09-data-fetching/01-action.md#execution-deadline), and not blocking first page response (application shell).

For every Deferred Actions will be created a promise, which status will be "teleported" to the client-side after it is resolved (or rejected) at server-side.

With new `Await` component, this unresolved promise will be thrown to nearest `Suspense` boundary, and `fallback` will be rendered and sended to the client with application shell.

After promise resolve or reject, React will send code to render suspended `Await` component into the response stream, and `tramvai` will send promise payload and status to the client.

At client side, application shell hydration will be started as soon as possible. For suspended `Await` component, hydration will be delayed until the promise will be resolved or rejected.

## Usage

### Prerequisites

For this feature to work, you need to install `react>=18` version and enable [streaming rendering](03-features/010-rendering/06-streaming.md):

```ts
import { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';

const provider = provide({
  provide: REACT_SERVER_RENDER_MODE,
  useValue: 'streaming',
});
```

### Deferred Actions

:hourglass: First, create a [page actions](03-features/09-data-fetching/01-action.md#page-actions) with new `deferred` property:

```ts
import { declareAction } from '@tramvai/core';

const deferredAction = declareAction({
  name: 'deferred',
  // highlight-next-line
  deferred: true,
  fn() {
    return this.deps.httpClient.get('/slow-endpoint');
  },
  deps: {
    httpClient: HTTP_CLIENT,
  },
});
```

:hourglass: Then, provide this action to page component `actions`, and `Await` component. Data will be available in `Await` children function:

```tsx
import { PageComponent } from '@tramvai/react';
// highlight-next-line
import { Await } from '@tramvai/module-common';

const Page: PageComponent = () => {
  return (
    <>
      <Header />
      // highlight-start
      <Suspense fallback={<div>Loading...</div>}>
        <Await action={deferredAction}>
          {(data) => <div>Result: {JSON.stringify(data)}</div>}
        </Await>
      </Suspense>
      // highlight-end
      <Footer />
    </>
  )
};

// highlight-next-line
Page.actions = [deferredAction];

export default Page;
```

After that, at page initia load (or with disabled JS) you will see header, footer and `Loading...` fallback. After API response, data will be teleported to client, and you will see the `Result: ...` instead of fallback.

You can change `deferred: true` to `conditions: { onlyBrowser: true }` and compare how slower results render will be.

### Actions timeout

Deferred actions execution time are limited by [response stream timeout](03-features/010-rendering/06-streaming.md#response-stream-timeout).

## How-to

### Use deferred actions with route dynamic parameters

[Page with dynamic parameters](03-features/07-routing/03-working-with-url.md#route-params) it is a common case, and have full Deferred Actions support with important nuance - you need to **manually subscribe** to the route changes in your component where `Await` is used.

Let's update our previous example:

```tsx
import { declareAction } from '@tramvai/core';
import { PageComponent } from '@tramvai/react';
import { Await } from '@tramvai/module-common';
    // highlight-next-line
import { useRoute } from '@tinkoff/router';

const deferredAction = declareAction({
  name: 'deferred',
  deferred: true,
  fn() {
    // highlight-next-line
    const id = this.deps.pageService.getCurrentRoute().params.id;

    return this.deps.httpClient.get('/slow-endpoint', { query: { id } });
  },
  deps: {
    httpClient: HTTP_CLIENT,
    pageService: PAGE_SERVICE_TOKEN,
  },
});

const Page: PageComponent = () => {
  // highlight-next-line
  const { params } = useRoute();

  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading...</div>} key={params.id}>
        <Await action={deferredAction}>
          {(data) => <div>Result: {JSON.stringify(data)}</div>}
        </Await>
      </Suspense>
      <Footer />
    </>
  )
};

Page.actions = [deferredAction];

export default Page;
```

Because of the `useRoute` hook, `Await` will use correct Deferred Action for current route at first load and after SPA-transitions.

### Use tramvai lazy inside Await component

Deferred Actions have full support with `tramvai` `lazy`, sync JS and CSS tags for dynamic import will be injected into the response stream after deferred promise resolve, and will be loaded and parsed before suspended component hydration - no content shifting or hydration errors! Simple example:

```tsx
import { lazy } from '@tramvai/react';

const LazyDataCmp = lazy(() => import('~components/DataCmp'));

const RootCmp = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Await action={deferredAction}>
          {(data) => <LazyDataCmp data={data} />}
        </Await>
      </Suspense>
    </>
  )
};
```

### Use deferred actions data outside React components

Deferred Actions + `Suspense` and `Await` has one important limitation - deferred data is used only inside React components, and you can't dispatch deferred data to the reducer at server-side in this actions, because only initial state will be passed to client with app shell.

Meaning this **will not** work:

```ts
const deferredAction = declareAction({
  name: 'deferred',
  deferred: true,
  async fn() {
    const { payload } = await this.deps.httpClient.get('/slow-endpoint');

    // it is too late, store initial state already sent to client
    // highlight-next-line
    this.dispatch(slowEndpointReducerSuccessEvent(payload));
  },
  deps: {
    httpClient: HTTP_CLIENT,
  },
});
```

As a workaround, you can wait Deferred Actions manually at client-side in usual action. All deferred actions available in `DEFERRED_ACTIONS_MAP_TOKEN`. Let's update our first example:

```tsx
// deferredAction without any changes

// create a reducer to store deferred data
const DeferredState = createReducer({
  name: 'deferredState',
  initialState: { status: 'pending' },
  events: {
    success: (state, payload) => ({ status: 'success', payload }),
  },
});

// create a browser-only action for data syncronization
const deferredStateSyncAction = declareAction({
  name: 'deferredStateSync',
  async fn() {
    // use deferred action name as a key 
    const deferred = this.deps.deferredActionsMap.get(
      deferredAction.name
    );

    // wait for deferred promise (in real-world case don't forget to handle error case)
    await deferred!.promise;

    // sync deferred data with our new store
    this.dispatch(
      deferredState.events.success(deferred!.resolveData)
    );
  },
  deps: {
    deferredActionsMap: DEFERRED_ACTIONS_MAP_TOKEN,
  },
});

// component will be rendered after Deferred Action resolve
const DeferredStateCmp = () => {
  const syncAction = useActions(deferredStateSyncAction);
  const state = useStore(deferredState);

  // run sync action immediately
  useEffect(() => {
    syncAction();
  }, []);

  return (
    <>
      {state.status === 'pending' ? (
        <div>Loading...</div>
      ) : (
        <div>{`Response: ${state.payload.data}`}</div>
      )}
    </>
  )
}

const Page: PageComponent = () => {
  return (
    <>
      <h1>Deferred State Page</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <Await action={deferredAction}>
          {() => <DeferredStateCmp />}
        </Await>
      </Suspense>
    </>
  );
};

Page.reducers = [deferredState];

Page.actions = [deferredAction];

export default Page;
```

Without `Suspense` and `Await`, `tramvai` will stream only deferred data to the client, for React all this component will be rendered as app shell, at first HTML chunk.
