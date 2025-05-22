---
id: persistent-state
title: How to manage persistent state?
---

Tramvai is an isomorphic framework that operates seamlessly on both the server and client sides. One thing to keep in mind is correctly synchronize content between the server and client to prevent [hydration](https://react.dev/reference/react-dom/client/hydrateRoot#hydrating-server-rendered-html) errors, which can lead to page flickering or can break markup completely. This guide provides insights on how to avoid these situations.

## Prevent hydration errors

There are a few methods to synchronize state between server and client:

### Setting state after Client-Side Rendering

One approach is to set the local state after the client-side render, during the [clear](03-features/06-app-lifecycle.md#clear) stage. While this method allows you to synchronize the state post-render, it means that the initial render will display with default values, followed by a re-render once the state is updated. This can lead to a flicker as the application transitions from the default values to the synchronized state, but you can still can render skeletons during the first render.

```typescript
provide({
  provide: commandLineListTokens.clear,
  useFactory: ({ store }) => {
    return function handleLocalState() {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const localState = localStorage.getItem(key);

        store.dispatch(setPageErrorEvent(localState));
      } catch (error) {
        // ...
      }
    };
  },
  deps: {
    store: STORE_TOKEN,
  },
});
```

### Setting state before the hydration

If your component uses local data and is only rendered on the client side, you can initialize the state before reaching the `generatePage` stage and hydration. This approach allows you to set the state earlier in the lifecycle, ensuring that the correct data is displayed from the first render, preventing any flicker or mismatch due to late updates.

:::note

Client Only component is component, which renders content only in the browser and renders `null` or some loader/skeleton on the server.

:::

```typescript
provide({
  provide: commandLineListTokens.customerStart,
  useFactory: ({ store }) => {
    return function handleLocalState() {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const localState = localStorage.getItem(key);

        store.dispatch(setPageErrorEvent(localState));
      } catch (error) {
        // ...
      }
    };
  },
  deps: {
    store: STORE_TOKEN,
  },
});
```

### Synchronizing state between server and client using cookies

Another effective method for preventing hydration errors is synchronizing the state between the server and client using cookies, similar to the approach used with [MediaStore from @tramvai/module-client-hints](references/modules/client-hints.md#how-does-media-work).

```tsx
import { createReducer, createEvent } from '@tramvai/state';
import { safeParseJSON } from '@tramvai/safe-strings';

export const change = createEvent('change');
export const Store = createReducer('state', {
  counter: 0,
  synchronized: false,
}).on(change, (state, payload) => ({ ...state, ...payload }));

const Component: React.FC = () => {
  const { synchronized, counter } = useStore(Store);

  // Do not use data until it not synchronized
  if (!synchronized) {
    return <Skeleton />;
  }

  return <div>Counter is {counter}</div>;
};

// On the server side read client
// state from cookies and synchronize it if exists
provide({
  provide: commandLineListTokens.resolveUserDeps,
  useFactory: ({ context, cookieManager }) =>
    function syncStore() {
      if (typeof window === 'undefined') {
        const synchronizedDataFromClient = safeParseJSON(cookieManager.get(PERSISTENT_DATA) ?? '');

        if (synchronizedDataFromClient !== null) {
          context.dispatch(
            change({
              ...synchronizedDataFromClient,
              synchronized: true,
            })
          );

          return;
        }
      }
    },
  deps: {
    context: CONTEXT_TOKEN,
    cookieManager: COOKIE_MANAGER_TOKEN,
  },
});

// On the client side, after hydration (clear stage)
// write state to cookies and rerender
provide({
  provide: commandLineListTokens.clear,
  useFactory: ({ context, cookieManager }) =>
    function saveDataToCookies() {
      if (typeof window !== 'undefined') {
        const data = getDataFromLocalStorage();

        cookieManager.set({
          name: PERSISTENT_DATA,
          value: JSON.stringify(data),
        });

        context.dispatch(change(data));
      }
    },
  deps: {
    context: CONTEXT_TOKEN,
    cookieManager: COOKIE_MANAGER_TOKEN,
  },
});
```

The process involves the following steps:

- Server and client does not use data for rendering until it's not synchronized;
- After hydration client reads data from local storage, save it to cookies and re-renders;
- If server receives synchronized data on subsequent requests it can use it to render.

This method ensures that both client and server work with consistent and synchronized state data, minimizing the chances of hydration errors.

## Saving state

To save state on the client side using `localStorage`, you can use [subscribe](03-features/08-state-management.md#subscribe) method of the store. It's important to wrap the `localStorage` operations in a `try/catch` block to handle potential errors, such as when the user denies write access.

Worth noting that subscription should be set as soon as possible and no more than once. So, if you need kind of global synchronization use `customerStart` stage:

```typescript
import { commandLineListTokens } from '@tramvai/core';

export const CounterStore = createReducer('counter', 0);

provide({
  provide: commandLineListTokens.customerStart,
  useValue: function persistState() {
    CounterStore.subscribe((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // Handle the error appropriately, or just ignore it
      }
    });
  },
});
```
