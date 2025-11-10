# CookieModule

Module for cookie parsing and setting. The module is provided with the `@tramvai/module-common`.

## Installation

Module is already provided with the `@tramvai/module-common` so no additional actions are needed if you are already use common module. Otherwise install `@tramvai/module-cookie` manually.

## Explanation

Implements interface `CookieManager` and adds provider `COOKIE_MANAGER_TOKEN` from the `@tramvai/module-common`

### Features

- Isomorphic code that works on server and client
- Uses deduplication for the same cookie entries on server
- Uses secure parameter by default

## How to

### Working with cookies

```tsx
import { Module, provide } from '@tramvai/core';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/module-common';

@Module({
  providers: [
    provide({
      provide: 'my_module',
      useFactory: ({ cookie }) => {
        cookie.set('sid', 'ads.api3');
        cookie.get('sid'); // > ads.api3
      },
      deps: {
        cookie: COOKIE_MANAGER_TOKEN,
      },
    }),
  ],
})
class MyModule {}
```

### Set multiple cookies with the same key

By default, cookies with the same key are deduplicated on the server-side. To set multiple cookies with the same key, you can use a unique identifier for each cookie with the `ResponseManager.setCookie` method:

```tsx
import { Module, provide } from '@tramvai/core';
import { RESPONSE_MANAGER_TOKEN } from '@tramvai/module-common';

@Module({
  providers: [
    provide({
      provide: 'my_module',
      useFactory: ({ responseManager }) => {
        responseManager.setCookie('b', `b=b; Path=/; SameSite=Strict`);
        // different identifier 'b-subpath' to avoid deduplication, will not affect the cookie name
        responseManager.setCookie('b-subpath', `b=b; Path=/foo/bar/; SameSite=Strict`);
      },
      deps: {
        responseManager: RESPONSE_MANAGER_TOKEN,
      },
    }),
  ],
})
class MyModule {}
```

## Exported tokens

### COOKIE_MANAGER_TOKEN

Instance of cookie manager

```tsx
interface CookieSetOptions {
  name: string;
  value: string;
  expires?: number | Date | string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

interface CookieManager {
  get(name: any): string;
  all(): Record<string, string>;
  set({ name, value, ...options }: CookieSetOptions): void;
  remove(name: string): void;
}
```
