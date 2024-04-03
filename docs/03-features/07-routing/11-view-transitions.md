---
id: view-transitions
title: View Transitions
---

## Overview

View Transitions is a brand-new API which allows to animate SPA-navigations. You can read more about it [here](https://developer.chrome.com/docs/web-platform/view-transitions).

In a nutshell, it works like this:

1. First, when you are calling `document.startViewTransition` and updating DOM inside it, browser takes a snapshot of the current DOM state.
2. Then, after updating DOM, browser starts an animated transition between two states, and creates next pseudo-elements tree:
   ```text
   ::view-transition
   └─ ::view-transition-group(root)
      └─ ::view-transition-image-pair(root)
         ├─ ::view-transition-old(root)
         └─ ::view-transition-new(root)
   ```
3. The old view animates from opacity: 1 to opacity: 0, while the new view animates from opacity: 0 to opacity: 1, creating a cross-fade.

All the animations are performed using CSS animations, so they can be customized with CSS.

:::info

Only SPA navigations supported at the moment. Support for MPA navigations coming soon.

:::

## Usage

Usage of the View Transition API is completely safe and do not require much step to set up. First, enable it in Tramvai config:

```json
{
  "experiments": {
    "viewTransitions": true
  }
}
```

It will enable a special router provider for React and removes the default one from your bundle.

Second, you should pass property named `viewTransion` to your navigation. It can be either prop of a `Link` component or a navigation parameter:

:::tip

Using the view transitions assumes, that all actions should be executed before navigation, so consider to set `ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN: 'before'`.

Otherwise, if you have a route, that depends on some action and renders conditionally – view transitions to this route may not work, because view transition will end before the route is ready to display relevant UI, To recap: browser compares two DOM states: before view transition and after, so it's expect to see final UI at the end of view transition.

:::

```tsx
import { Link } from '@tramvai/module-router';
import { useNavigate } from '@tinkoff/router';

const Component: React.FC = () => {
  const navigate = useNavigate({ url: '/home', viewTransition: true });

  return (
    <section>
      <button type="button" onClick={navigate}>
        Take me home
      </button>

      <Link url="/country-roads" viewTransition>
        Country Roads
      </Link>
    </section>
  );
};
```

This is enabling default animation between routes (smooth cross-fade), that can be suitable for some cases. But if you want to customize your transitions, you should add some CSS styles.

### Elements transition

Actually the default transition isn't just a cross-fade, the browser also transitions:

- Position and transform (via a transform);
- Width;
- Height;

So, if you want to apply such behavior to elements on different pages, just add `view-transition-name` to them with the same value:

```tsx
import { useNavigate } from '@tinkoff/router';

// route 1
const Component: React.FC = () => {
  const navigate = useNavigate({ url: '/target', viewTransition: true });

  return (
    <section>
      <button type="button" onClick={navigate}>
        Show me the meaning
      </button>

      <img
        alt="Preview of the image"
        src="https://tinkoff.cdn.ru/image.png"
        style={{ viewTransitionName: 'image-expand' }}
      />
    </section>
  );
};

// route 2
const TargetComponent: React.FC = () => {
  return (
    <img
      alt="Detailed image"
      src="https://tinkoff.cdn.ru/detailed-image.png"
      style={{ viewTransitionName: 'image-expand' }}
    />
  );
};
```

### useViewTransition

Also, you can use special hook which will tell you when a transition is in progress, and you can use that to apply classes or styles:

```tsx
import { useNavigate, useViewTransition } from '@tinkoff/router';

// route 1
const Component: React.FC = (props) => {
  const isTransitioning = useViewTransition(`/item/${props.id}`);

  return (
    <section style={isTransitioning ? { viewTransitionName: 'card-expand' } : undefined}>
      Preview of an element in the list
    </section>
  );
};
```

### Exclude elements from transition

If some of your content does not a part of animated transition, or you want to transition multiple elements, you can assign a different `view-transition-name` to the element.

The value of `view-transition-name` can be whatever you want (except for `none`, which means there's no transition name).

### Custom animations

You can customize your animations in any way, for example `slide` animations will look like this:

```css
@keyframes slide-from-right {
  from {
    transform: translateX(30px);
  }
}

@keyframes slide-to-left {
  to {
    transform: translateX(-30px);
  }
}

::view-transition-old(root) {
  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
}

::view-transition-new(root) {
  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
}
```

We recommend to see at this [article](https://developer.chrome.com/docs/web-platform/view-transitions) by Google, containing a lot of nice examples.

### Prefers reduced motion

Tramvai includes CSS to [preserve](https://developer.mozilla.org/ru/docs/Web/CSS/@media/prefers-reduced-motion) user settings about animations behavior.

So, if a user select to prefer reduced motions, view transitions will not be working.

### Browser support

Supported browsers are:

- Chromium-based >= 111.0
- Opera >=97.0

But it is safe to use it anywhere, no polyfill required.

## Explanation

Here you can see a diagram explains how does the react provider work: ![Diagram](/img/router/view-transitions.svg)
