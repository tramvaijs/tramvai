---
id: lifecycle
title: Lifecycle
---

## Explanation

Child Apps have their own `CommandLineRunner` flow, which is very similar to the [Root App lifecycle](03-features/06-app-lifecycle.md), with the exception that there is no global command line stages like `init` and `listen`, only request-scoped stages.

Root Application controls when Child Apps command lines will be executed, it will be done in own command line stages, and Root App will try to execute all used on current page Child Apps command lines in parallel.

### Server flow

Used when page is processed on server.

- `customer` command line: [`customerStart` -> `resolveUserDeps` -> `resolvePageDeps`]
- `clear` command line: [`clear`]

![command-line-runner](/img/child-app/command-line-runner-server.drawio.svg)

Stage when Root App will start this command lines can be different depending on the Child App was preloading or not:

- If Child App was preloaded before Root App `resolvePageDeps` then `customer` line list is executed on Root App `resolvePageDeps` line
- If Child App was preloaded on Root App `resolvePageDeps` then `customer` line list is executed as soon as Child App was loaded. `preload` call must be awaited in order to prevent Root App CommandLineRunner to passing to next line. That still counts as executing on `resolvePageDeps` line.
- Child-app `clear` line list is executed on Root App `clear` line for every Child App that was preloaded on previous lines

### Client flow

Used when page is hydrated on client.

- `customer` command line: [`customerStart` -> `resolveUserDeps` -> `resolvePageDeps`]
- `clear` command line: [`clear`]

If specific child-app was preloaded on server then it behaves identical to server flow:

![command-line-runner](/img/child-app/command-line-runner-client-loaded.drawio.svg)

If specific child-app was not preloaded on server but used on current page then the flow will be:

![command-line-runner](/img/child-app/command-line-runner-client-not-loaded.drawio.svg)

### SPA transition flow

Used on client for subsequent navigations without page reloading.

Child App is considered not preloaded on SPA-navigation for next page, when:

- it is not [automatically preloaded](03-features/016-child-app/010-connect.md#preload-automatically-for-page-or-layout)
- it is not [manually preloaded](03-features/016-child-app/010-connect.md#preload-manually)
- or it is preloaded first time at client-side (or you can [force Child App loading before navigation](#how-to-preload-child-app-before-spa-navigation))

If specific child-app was preloaded before and was preloaded for the next page:

- `spa` command line: [`resolveUserDeps` -> `resolvePageDeps` -> `spaTransition`]
- `afterSpa` command line: [`afterSpaTransition`]

![command-line-runner](/img/child-app/command-line-runner-spa-loaded.drawio.svg)

If specific child-app was not preloaded before or was preloaded for the next page first time:

- `customer` command line: [`customerStart` -> `resolveUserDeps` -> `resolvePageDeps`]
- `clear` command line: [`clear`]

![command-line-runner](/img/child-app/command-line-runner-spa-not-loaded.drawio.svg)

## Usage

Command line stages is a good place to make common actions for current page, for example:

- add new assets (scripts, fonts, etc.)
- services configuration
- fetch some global data
- basic metrics, analytics

For other cases, especially API calls, prefer to use [Actions](03-features/016-child-app/07-data-fetching.md#actions).

:::tip

It is important to make command line stages as fast as possible, because they are directly delaying response for user. Few tips how to make page response fast:

- Use [Actions](03-features/016-child-app/07-data-fetching.md#actions) for requests - they are executed in parallel with Root App Actions
- If you still need to fetch data in command line and use it in different Actions / services, try to cache this data at [HTTP Client](03-features/016-child-app/07-data-fetching.md#http-client) level - this cache can be shared between all Child Apps and requests

:::

### Installation

First, you need to install `@tramvai/module-common` module in your Child App:

```bash
npx tramvai add @tramvai/module-common
```

Then, connect `CommonChildAppModule` from this module in your `createChildApp` function:

```ts
import { createChildApp } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { RootCmp } from './components/root';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'fancy-child',
  render: RootCmp,
  modules: [CommonChildAppModule],
  providers: [],
});
```

### Add new command

It is important to use `commandLineListTokens` from `@tramvai/child-app-core` to add commands in Child App. Common mistake is to import this object from `@tramvai/core`, but it will work only in Root App.

For example, let's add log for every Child App `CommandLineRunner` execution start:

```ts
import { provide } from '@tramvai/core';
// highlight-next-line
import { createChildApp, commandLineListTokens } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { RootCmp } from './components/root';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'fancy-child',
  render: RootCmp,
  modules: [CommonChildAppModule],
  providers: [
    // highlight-start
    provide({
      provide: commandLineListTokens.customerStart,
      useFactory: ({ logger }) => {
        const log = logger('fancy-child');

        return function customerStart() {
          log.info('fancy-child command line started');
        };
      },
    }),
    // highlight-end
  ],
});
```

You can see this log both on server-side and client-side, when page with `fancy-child` Child App will be rendered.

## How to

### How to preload Child App before SPA-navigation?

By default, when specific Child App is used first time on next page on SPA transition, his preloading will not block this transition and new screen from rendering.

You can change this behaviour with [manual preloading](03-features/016-child-app/010-connect.md#preload-manually):

```ts
import { provide, commandLineListTokens } from '@tramvai/core';
import { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

const provider = provide({
  provide: commandLineListTokens.resolvePageDeps,
  useFactory: ({ preloadManager, pageService }) => {
    const config = { name: 'fancy-child' };
    let isSpaNavigation = false;

    return function preloadFancyChildApp() {
      // for SPA-navigation to specific page with this Child App
      if (isSpaNavigation && pageService.getCurrentUrl().pathname === '/fancy-child/') {
        if (!preloadManager.isPreloaded(config)) {
          // workaround for correct Child App initialization lifecycle
          preloadManager.saveNotPreloadedForSpaNavigation(config);
        }
        // wait for preloading
        return preloadManager.preload(config);
      }

      // second call of `resolvePageDeps` command means that it is SPA-navigation
      if (!isSpaNavigation) {
        isSpaNavigation = true;
      }
    };
  },
  deps: {
    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,
    pageService: PAGE_SERVICE_TOKEN,
  },
});
```
