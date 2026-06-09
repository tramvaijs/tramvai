# Autoscroll

Module emulates native browser scroll behavior on SPA-navigations:

- scroll to top of the page if there is no hash in the URL
- scroll to the element with id that equals to the hash in the URL if it exists
- restore scroll position on back/forward navigations

The behaviour is similar to the [react-router](https://reactrouter.com/api/components/ScrollRestoration)

## Installation

First install `@tramvai/module-autoscroll`:

```bash npm2yarn
yarn add @tramvai/module-autoscroll
```

And add `ScrollRestorationModule` to the modules list:

```tsx
import { createApp } from '@tramvai/core';
import { ScrollRestorationModule } from '@tramvai/module-autoscroll';

createApp({
  name: 'tincoin',
  modules: [ScrollRestorationModule],
});
```

## Explanation

### Behavior

`behavior: smooth` is not supported by every browser (e.g. doesn't work in Safari). In this case you can use polyfill `smoothscroll-polyfill` that you should add to your app.

### Scroll restoration

Native browser scroll restoration is disabled when autoscroll is enabled (`window.history.scrollRestoration = 'manual'`, depending on the `navigateState.disableAutoscroll` parameter or `AUTOSCROLL_DISABLED_TOKEN` token).

Module saves scroll position on every navigation and restores it on back/forward navigations. Scroll position is saved in `sessionStorage` by navigation index (`history.state.index`).

## How to

### Disable autoscroll for page

If you need to disable autoscroll on the specific pages you can specify parameter `navigateState.disableAutoscroll = true` to the `navigate` call:

```tsx
import { useNavigate } from '@tramvai/module-router';

function Component() {
  const navigateToWithoutScroll = useNavigate({
    url: '/url/',
    navigateState: { disableAutoscroll: true },
  });

  return <Button onClick={navigateToWithoutScroll} />;
}
```

### Disable autoscroll for custom conditions

By default, autoscroll is disabled, when `navigateState.disableAutoscroll` is `true`.

For example, if you want to disable it for all `updateCurrentRoute` calls, you can provide `AUTOSCROLL_DISABLED_TOKEN` token:

```tsx
import { AUTOSCROLL_DISABLED_TOKEN } from '@tramvai/module-autoscroll';
import { provide } from '@tramvai/core';

const providers = [
  // ...,
  provide({
    provide: AUTOSCROLL_DISABLED_TOKEN,
    useFactory:
      ({ router }) =>
      () => {
        // disable autoscroll for navigation with query `?autoscroll_disabled=true`
        if (router.getCurrentUrl().query.autoscroll_disabled === 'true') {
          return true;
        }
        // return nothing to use default behavior
      },
    deps: {
      router: ROUTER_TOKEN,
    },
  }),
];
```

### Use autoscroll with View Transitions

To avoid inconsistent animations when using View Transition API (e.g. X and Y axis movements in the same time), recommended to set autoscroll behavior to `instant`:

```tsx
import { AUTOSCROLL_BEHAVIOR_MODE_TOKEN } from '@tramvai/module-autoscroll';
import { provide } from '@tramvai/core';

const providers = [
  // ...,
  provide({
    provide: AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
    useValue: (defaultBehavior) => 'instant', // default is 'smooth' for autoscroll in new pages or anchors and 'instant' for scroll restoration
  }),
];
```

### Scroll behavior change

#### Global

```tsx
import { AUTOSCROLL_BEHAVIOR_MODE_TOKEN } from '@tramvai/module-autoscroll';
import { provide } from '@tramvai/core';

const providers = [
  // ...,
  provide({
    provide: AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
    useValue: (defaultBehavior) => 'auto', // default is 'smooth' for autoscroll in new pages or anchors and 'instant' for scroll restoration
  }),
];
```

#### Local

```tsx
import { useNavigate } from '@tramvai/module-router';

function Component() {
  const navigateToWithAutoBehavior = useNavigate({
    url: '/url/',
    navigateState: { autoscrollBehavior: 'auto' },
  });

  return <Button onClick={navigateToWithAutoBehavior} />;
}
```

### Scroll top change

#### Global

```tsx
import { AUTOSCROLL_SCROLL_TOP_TOKEN } from '@tramvai/module-autoscroll';
import { provide } from '@tramvai/core';

const providers = [
  // ...,
  provide({
    provide: AUTOSCROLL_SCROLL_TOP_TOKEN,
    useValue: -1, // default is 0
  }),
];
```

#### Local

You can also provide a function that will return scroll top value, for example if you save page scroll position in sessionStorage and then want to restore it:

```tsx
import { AUTOSCROLL_SCROLL_TOP_TOKEN } from '@tramvai/module-autoscroll';
import { provide } from '@tramvai/core';

const providers = [
  // ...,
  provide({
    provide: AUTOSCROLL_SCROLL_TOP_TOKEN,
    // if `isRestoredValue` is `true`, it means that `defaultScrollTop` is resolved previous position for auto scroll restoration
    useValue: (defaultScrollTop, isRestoredValue) => {
      try {
        const savedScrollTop = JSON.parse(sessionStorage.get('scrollTop'));
        // for example, if you save scroll position by navigation index
        return savedScrollTop[history.state.index] ?? 0;
      } catch (e) {
        return 0;
      }
    },
  }),
];
```
