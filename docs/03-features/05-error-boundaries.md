---
id: error-boundaries
title: Error Boundaries
---

In SSR applications errors can occur in different stages:

- On server initialization
- At runtime, when server handle user request
- On browser page loading
- At runtime, during hydration, or when user interacts with page and make SPA-navigations

Server initialization errors block application deployment, easy to find and almost never reach the user. Moreover, `tramvai` provides a module [@tramvai/module-error-interceptor](references/modules/error-interceptor.md), that adds global error handlers to the application on the server-side.

Errors during page loading are often caused by network problems. Client application may be more resistant to bad connections with different techniques - e.g. Service Worker, retry resources requests - but such techniques will be specific to each application.

Runtime errors, both on server in browser, can be critical and require send error page in reply to the user with some `5xx` status.

This guide will be focused how to customize and show error pages for the users in different scenarios.

## Page Error Boundary

If the first rendering of the page on the server fails, `tramvai` will try to render the page a second time, but already using the Error Boundary with fallback component. Also, we use [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html) under the hood, so the error fallback will render in case of any rendering errors in the browser.

Error Boundary only wrap Page Component, and Nested Layout with Root Layout will be rendered as usual.

Here is a list of cases when Page Error Boundary will be rendered with priority over [Root Error Boundary](#root-error-boundary):

- Error Boundary [forced render in Guard or Action](#force-render-page-error-boundary-in-action)
- React page component rendering failed

You can provide default fallback for all pages, and specific fallback to concrete page. In this fallback components `tramvai` will pass `url` and `error` properties:

```tsx title="DefaultErrorBoundary.tsx"
export const DefaultErrorBoundary = ({ url, error }) => {
  return (
    <div>
      <h1>Something wrong!</h1>
      <p>Location: {url.path}</p>
      <p>Error: {error.message}</p>
    </div>
  );
};
```

:::info

Default response status for server-side Error Boundary - `500`. This status can be changed by adding `httpStatus` property to `Error` object.

:::

### Default fallback

<!-- @TODO: default fallback for file-system routing! -->

You can provide default error fallback component for all pages by using token `DEFAULT_ERROR_BOUNDARY_COMPONENT`:

```ts
import { DEFAULT_ERROR_BOUNDARY_COMPONENT } from '@tramvai/tokens-render';

const provider = {
  provide: DEFAULT_ERROR_BOUNDARY_COMPONENT,
  useValue: DefaultErrorBoundary,
};
```

This error boundary is also used by client render/hydration in cases where an error happens before the page is being rehydrated or rendered. The boundary wouldn't work if you're providing `CUSTOM_RENDER` token for your client rendering process; you should handle it yourself.

### Specific fallback

There are two ways to add a specific error boundary to the page.

#### `_error.tsx`

You can declare an error boundary to the page by adding a file called `_error.tsx` near the page component:

```
src
└── pages
    └── login
      └── index.tsx
      └── _error.tsx
```

The component signature still be the same as the [DefaultErrorBoundary](#page-error-boundary), so properties `error` and `url` will be available here.

#### For manually created route

Concrete fallback for any of application pages can be registered in route configuration:

:hourglass: Create fallback component in `pages` directory:

```tsx title="pages/comments-fallback.tsx"
export const CommentsFallback = ({ error }) => {
  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>Can't show comments, reason: {error.message}</p>
    </div>
  );
};
```

And we will get this file structure:

```
src
└── pages
    ├── comments.tsx
    └── comments-fallback.tsx
```

:hourglass: Add `errorBoundaryComponent` to route configuration:

```tsx
import { SpaRouterModule } from '@tramvai/modules-router';

createApp({
  modules: [
    SpaRouterModule.forRoot([
      {
        name: 'comments',
        path: '/comments/',
        config: {
          pageComponent: '@/pages/comments',
          // highlight-next-line
          errorBoundaryComponent: '@/pages/comments-fallback',
        },
      },
    ]),
  ],
});
```

## Root Error Boundary

If a critical error occurred during the request handling, e.g. Page Error Boundary rendering was unsuccessful, or an exception has been thrown out in any [CommandLineRunner](concepts/command-line-runner.md) stages before rendering, `tramvai` provides an opportunity to render both custom `5xx` and `4xx` page. Root Boundary works only on server side.

Here is a list of cases when Root Error Boundary will be rendered:

- when `NotFoundError` thrown out in Actions (4xx)
- when `HttpError` thrown out in Actions (4xx or 5xx)
- Router Guard block navigation (500)
- Route is not found (404)
- Error Boundary [forced render in Guard or Action](#force-render-page-error-boundary-in-action) (4xx or 5xx)
- Request Limiter blocked request (429)
- React page component rendering failed (500)
- Other unexpected server-side errors, for example [Fastify Errors](https://www.fastify.io/docs/latest/Reference/Errors/) (4xx or 5xx)

:::info

Root Error Boundary works only server-side

:::

You can provide this boundary by creating a file `error.tsx` in a project source directory with default export of the component. You also can override path for `error.tsx` with option `rootErrorBoundaryPath` in tramvai configuration for application; path relative to project root.

This components will have access to `error` and `url` props, and need to render complete HTML page, e.g.:

```tsx title="src/error.tsx"
import React, { useEffect, useState } from 'react';
import type { ErrorBoundaryComponent } from '@tramvai/react';

import styles from './styles.module.css';

const RootErrorBoundary: ErrorBoundaryComponent = ({ error, url }) => {
  const message = `Error ${error.message} at ${url.path}`;

  const handleClick = async () => {
    await fetch('feedback', {
      method: 'post',
      body: JSON.stringify(error),
    });
  };

  return (
    <html lang="ru">
      <head>
        <title>{message}</title>
      </head>
      <body>
        <h1 className={styles.title}>Root Error Boundary</h1>

        <button onClick={handleClick}>Send feedback</button>
      </body>
    </html>
  );
};

export default RootErrorBoundary;
```

Tramvai will add necessary styles and scripts to the server response if you are using them.

Also, this component will be hydrated, so, you can use any React features here.

:::caution

If this component also crashes at the rendering stage, in case of `HttpError` user will get an empty `response.body`, otherwise [finalhandler library](https://github.com/pillarjs/finalhandler) will send default HTML page with some information about error.

:::

`RootErrorBoundary` also generates the static page on the `tramvai static` command by path `_errors/5xx/index.html` in your output for static. In this scenario of rendering, the error object in props would be equal to this json:

```json
{
  "name": "STATIC_ROOT_ERROR_BOUNDARY_ERROR",
  "message": "Default error for root error boundary"
}
```

You can rely on these constant values of errors to provide different renders for RootErrorBoundary. It's possible to override this error for the static page by providing a value for token `STATIC_ROOT_ERROR_BOUNDARY_ERROR_TOKEN` from `@tramvai/tokens-server`.

## How to

### Force render Page Error Boundary in Action

:::caution

`setPageErrorEvent` - experimental API, and can be changed in future releases.

:::

By default, errors in [actions](concepts/action.md) are skipped on server-side, and `tramvai` try to execute failed actions again in browser. If the action failed to fetch critical data for page rendering, and you want to change response status code, and show error page for user, you need to dispath `setPageErrorEvent` action:

```ts
import { declareAction } from '@tramvai/core';
import { HttpError } from '@tinkoff/errors';
import { setPageErrorEvent } from '@tramvai/module-router';

const action = declareAction({
  name: 'action',
  fn() {
    // set custom response status, `500` by default
    const error = new HttpError({ httpStatus: 410 });
    this.dispatch(setPageErrorEvent(error));
  },
});
```

### Force render Page Error Boundary in Router Guard

:::caution

`setPageErrorEvent` - experimental API, and can be changed in future releases.

:::

Errors in [router guards](references/libs/router.md#router-guards) will be ignored by default. Like the previous reciepe, if you need to render page fallback from guard, you can dispatch `setPageErrorEvent` inside:

```ts
import { STORE_TOKEN } from '@tramvai/module-common';
import { ROUTER_GUARD_TOKEN, setPageErrorEvent } from '@tramvai/module-router';
import { HttpError } from '@tinkoff/errors';

const provider = {
  provide: ROUTER_GUARD_TOKEN,
  multi: true,
  useFactory: ({ store }) => {
    return async ({ to }) => {
      // guards runs for every pages, and we need to check next path if want to show error only on specific routes
      if (to?.path === '/some-restricted-page/') {
        const error = new HttpError({ httpStatus: 503 });
        store.dispatch(setPageErrorEvent(error));
      }
    };
  },
  deps: {
    store: STORE_TOKEN,
  },
};
```

## Known Issues

### React Hydration Mismatch Due to User Browser Extensions

When rendering a Root Error Boundary:

- The server renders the boundary, which includes the HTML, head, and body.
- The server injects the necessary assets for the page to function into the head.
- On the client-side, the page gets hydrated.

At first glance, everything seems to be functioning as expected. However, if a user has a browser extension that also writes something to the head, React sees this as a mismatch during hydration. React then re-renders the boundary without the assets, which were only inserted during server-side rendering. This leads to the page breaking since the links to the assets are removed, causing the CSS (also maybe JS) to stop working.

[This GitHub Issue](https://github.com/facebook/react/issues/24430) has a list of workarounds.

#### Workarounds

1. Implement a HEAD Wrapper which renders your head content during server-side rendering, but during browser-side rendering it uses the current head content, ensuring that any modifications made by extensions are preserved during React hydration.

```jsx
if (process.env.BROWSER) {
  return <head dangerouslySetInnerHTML={{ __html: document.head.innerHTML }} />;
}

return <head>{/* YOUR CODE HERE */}</head>;
```

2. Remove Scripts and Links Outside of HEAD and Extension Scripts. This solution targets and removes certain scripts and links, including those added by extensions, to mitigate the issue:

```jsx
if (process.env.BROWSER) {
  document
    .querySelectorAll(
      'html > _:not(body, head), script[src_="extension://"], link[href*="extension://"], script[src*="scr.kaspersky-labs.com"], link[href*="scr.kaspersky-labs.com"]'
    )
    .forEach((s) => {
      s?.parentNode?.removeChild(s);
    });
}
```
