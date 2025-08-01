---
id: redirects
title: Redirects
---

Redirects can be done via [guards](03-features/07-routing/05-hooks-and-guards.md#guards) or explicitly via the `redirect` property in the route.

## Define redirect manually

:::tip

Use when redirect is completely static

:::

```ts
import { SpaRouterModule } from '@tramvai/modules-router';

createApp({
  modules: [
    SpaRouterModule.forRoot([{
      name: 'redirect',
      path: '/from/',
      redirect: '/to/',
    }]),
  ],
});
```

## Redirect in Guard

:::tip

Use when redirect logic is global and complex

:::

```ts
import { provide } from '@tramvai/core';
import { ROUTER_GUARD_TOKEN } from '@tramvai/module-router';

const provider = provide({
  provide: ROUTER_GUARD_TOKEN,
  useValue: async ({ to }) => {
    if (to && to.path === '/from/') {
      return '/to/';
    }
  },
});
```

## Redirect in Action

:::tip

Use when redirect logic is complex and local for one or a few pages

:::

:::info

Not working in Child Apps!

Use `router.navigate` method for redirect:

```ts
router.navigate({
  url,
  code: 301,
  replace: true,
});
```

:::

For example, you make a important request in action, and if this request fails, application need to redirect to another page. If you want to prevent page component rendering and force redirect, you can throw `RedirectFoundError` from `@tinkoff/errors` library:

```tsx
import { declareAction } from '@tramvai/core';
import { RedirectFoundError } from '@tinkoff/errors';
import { RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';

const redirectAction = declareAction({
  name: 'redirectAction',
  async fn() {
    throw new RedirectFoundError({ nextUrl: '/to/' });
  },
});

const RedirectPage = () => <h1>Redirect Page</h1>;

RedirectPage.actions = [redirectAction];

export default RedirectPage;
```

## Redirect in CommandLineRunner

:::tip

Use when redirect logic is complex and common for all pages

:::

For example, you want to check some cookie, and if this cookie does not exist, application need to redirect to another page. If you want to prevent page component rendering and force redirect, you can throw `RedirectFoundError` from `@tinkoff/errors` library:

```tsx
import { commandLineListTokens, provide } from '@tramvai/core';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { RedirectFoundError, makeErrorSilent } from '@tinkoff/errors';

createApp({
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      useFactory: ({ cookieManager }) => {
        return function readCustomCookie() {
          if (!cookieManager.get('someSessionCookie')) {
            const redirectError = new RedirectFoundError({ nextUrl: '/login/' });

            // to prevent error logs spam if this case are expected
            makeErrorSilent(redirectError);

            throw redirectError;
          }
        };
      },
      deps: {
        cookieManager: COOKIE_MANAGER_TOKEN,
      },
    }),
  ],
});
```
