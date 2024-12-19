---
id: react-18
title: React 18 features
---

## What's new in React 18

### Concurrent React

Many of the features in React 18 are built on top of the brand-new mechanism – concurrent renderer, that allows to interrupt rendering. It is increase performance of the client rendering overall.

Worth noting, that concurrent rendering [automatically enables](03-features/010-rendering/03-hydration.md) only for parts, those using it. That's why migration to React 18 will not be a problem.

### Batching updates

Batching is the process of grouping multiple updates into one single render. Previously updates inside of promises, setTimeout or native eventHandlers were not batched by default, but now such updates will be batched automatically.

Also, if you are using `unstable_batchedUpdates` you can stop using it safely.

You can see code examples [here](https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/batching/counter.tsx).

### Transitions

Transition is a new concept in React to distinguish between urgent and non-urgent updates:

- urgent updates - direct interaction, like typing, clicking, pressing, and so on;
- non-urgent updates - transition the UI from one view to another;

Urgent updates supposed to be handled immediately and show updated UI. In opposite, non-urgent updates are not showing every intermediate value on screen, but final result only. Such separation helps to cope with blocked user interactions due to non-urgent updates.

Any updates are urgent by default, but `startTransition` and `useTransition` let you mark some updates as not urgent. If an `urgent` update will happen during a `non-urgent` one React stop the current rendering and render only the latest update.

As far as you know, content wrapped in `Suspense` can be suspended for different reasons. To recall:

- there is [lazy](references/tramvai/react.md#lazy) component render, wrapped in `Suspense`;
- there is data loading in a component, wrapped in `Suspense`. Tramvai does not support it yet, but you can look into [Relay implementation](https://relay.dev/docs/guided-tour/rendering/loading-states/), or [origin RFC](https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md);
- content, wrapped in `Suspense` is waiting for corresponding CSS (currently in development by React team);

So, if a component will be suspended during non-urgent update React will prevent already-visible content from being replaced by a fallback. Instead, React will delay render until data has loaded.

To recap: any update of the state (`const [, setState] = useState(true)`), wrapped in `startTransition` will be considered as non-urgent and will not block user input.

### Suspense

`Suspense` lets to display `fallback` content for the parts of UI, that not ready to be displayed yet. In Tramvai it is suitable only for lazy components at the moment.

As far as you know Tramvai ships its own [way](references/tramvai/react.md#lazy) for lazy code loading – `@tramvai/lazy`. In comparison to classic `React.lazy`, Tramvai version has some advantages:

- it optimized for SSR;
- code of a component loads on the client before hydration;

That's why we recommend using only `@tramvai/lazy` in Tramvai apps.

Note, that all the content, wrapped in `Suspense`, even if it not suspends by self reasons, will be suspended.

Also, `Suspense` usage enables selective hydration. We have a [guide](03-features/010-rendering/03-hydration.md) about it already. Check it out!

In addition, `Suspense` allows to [intercept](#error-handling) server-side and hydration errors.

### Strict mode

In order for components to work properly in the future, a new behavior has been added to `StrictMode` called `StrictEffects`. The idea is to catch effects that don't work properly during development by React mounting the component twice, i.e.: `mount => unmount => mount`, calling corresponding effects and unsubscribe functions. It works only in DEV environment. You can enable it [such](references/modules/render.md#react-strict-mode) way.

## Tramvai integration

When you are using React 18, several features will be allowed to use:

### Streaming rendering

We have an article about [streaming rendering](03-features/010-rendering/06-streaming.md), check it out.

### Selective hydration

`hydrateRoot` wraps in `startTransition` on the client automatically. See [more](03-features/010-rendering/03-hydration.md).

### SPA-navigations with startTransition

We have experimental support for concurrent rendering with SPA-transitions - all navigations will be wrapped in `startTransition` automatically, and while rendering the next screen, the page will be responsive because the rendering process will be interruptible.

To enable this feature, you need to provide `experiments.reactTransitions` to `tramvai.json` config:
```json title="tramvai.json"
{
  "experiments": {
    "reactTransitions": true
  }
}
```

:::warning

`reactTransitions` is incompatible with direct [`router` store](03-features/07-routing/03-working-with-url.md#routerstore-reducer) usage in React components.

Bad:

```ts
const route = useStore(RouterStore);
```

```ts
const route = useSelector('router', (state) => state.router);
```

Good:

```ts
const route = useRoute();
```

```ts
const route = pageService.getCurrentRoute();
```

:::

### Suspense in Child App

Each Child App wraps into `Suspense` automatically.

## Tramvai use cases

### Suspense

#### Use cases

- displaying a fallback UI, during `lazy` component load
- handling server-side errors;

Look to the code example [here](https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/suspense/async.tsx).

### startTransition/useTransition

Mark a state update inside it as `non-urgent`, that allows to not block user input during subsequent updates `urgent` updates.

Outside the components you should use `startTransition` function, instead of `useTransition` hook.

#### Use cases

- wrap a navigation between tabs, when you have heavy to render tab components;
- don't show fallback UI for suspended components;

Take a look to the [example](https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-transition.tsx). Try to switch to the `Slow` tab, and then to the `Another` tab immediately. Navigation will happen straight away, despite slow rendering of the `Slow` tab. Also, there is no loading state for suspended content, when click to the `Switch` button.

### useId

Hook to generate same identifiers on server and client. Without it, if you will do it by yourself, e.g. just calling `uuid`, result values will be different on server and client. Also, you can't use simple counter (`nextId++`) for it, because React does not guarantee the order in which the client components are hydrated. Don't use it for generating keys in a list.

There is an [example](https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-id.tsx) in our repo. Run the app, go to the `/hooks` and look to the console. There is a hydration error for the `WithoutHook` component, and no such error for `WithHook`.

### useDeferredValue

Lets you defer re-rendering a non-urgent part of the UI.

Look at [example](https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-deferred-value.tsx).

#### How it works?

There are two steps for it:

1. First, when the update happens, React makes a render with **updated main** state, but with **not updated deferred** state;
2. Then in background, React tries to re-render with both main and deferred states updated. However, if it suspends or a new state update received, React will cancel the background render and retry it with a new value.

#### Use cases

- defer the rendering of a heavy UI;
- don't show `Suspense` fallback for suspended components;

Run the example app and go to the `/hooks`. Note, that user input does not block by the heavy results render.

#### Difference from debounce/throttling

`useDeferredValue`:

- Designed for the rendering optimizations and integrated with React deeply;
- There is no fixed time delay, so React will adjust to the user;
- Can abandon the rendering, by contrast `throttle` and `debounce` just postpone the moment when rendering blocks.

However, `throttle` and `debounce` are still useful. For example, they can let you fire fewer network requests.

### Error handling

Given the new features, handling rendering errors in React 18 looks like this:

1. If an error happens during SSR, then instead of throwing it to the whole application, React will find nearest `Suspense` boundary up to tree and include it fallback to the server response.
2. After that, on the client, React determines what could not be rendered and starts a client-side render from scratch for these parts.
3. If the client render was successful, React will render it, otherwise it will throw an error that can be caught by the `Error Boundary`.

Note, that same logic applies to the hydration errors, that is React discard server results to nearest `Suspense` boundary and renders in on the client from scratch.

That's why we are strongly recommend to wrap in `Suspense` boundary important parts of your application to improve performance. You can use the next structure as a reference:

```tsx
<ErrorBoundary fallback>
  <Suspense fallback>
    <Component />
  </Suspense>
</ErrorBoundary>
```

Note, that Tramvai add ErrorBoundary by default. See [more](03-features/05-error-boundaries.md).

Also, Tramvai log the rendering errors and deduplicate them, to avoid noise. In general, we are recommend do not ignore hydration errors, because they are affect performance. As the last resort you can [use](https://react.dev/reference/react-dom/hydrate#suppressing-unavoidable-hydration-mismatch-errors) `suppressHydrationWarning={true}` on the React component, e.g. to display time.

## Source links

- [React 18 overview](https://react.dev/blog/2022/03/29/react-v18)
- [Automatic batching](https://github.com/reactwg/react-18/discussions/21)
- [Transitions](https://github.com/reactwg/react-18/discussions/41)
- [Real world example with transitions](https://github.com/reactwg/react-18/discussions/65)
- [Suspense](https://github.com/reactwg/react-18/discussions/7)
- [Server errors in React 18](https://github.com/reactjs/rfcs/blob/main/text/0215-server-errors-in-react-18.md)
- [React 18 upgrade guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
