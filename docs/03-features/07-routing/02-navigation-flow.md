---
id: flow
title: Navigation Flow
---

`tramvai` router is universal, and work both on server and client sides. But navigation flow is different for all environments and router modules. Also, router has it is own lifecycle, but this flow is embedded in `commandLineRunner` lifecycle.

## Server navigation

At server-side, router navigation will be executed at [resolve_user_deps](03-features/06-app-lifecycle.md#resolve_user_deps) command. Router `hooks` and `guards` will be launched in the process:

![Diagram](/img/router/navigate-flow-server.drawio.svg)

:::info

Router will run page actions at [resolve_page_deps](03-features/06-app-lifecycle.md#resolve_page_deps) stage.

:::

## Client initialization

After page load, router rehydration will be executed at [customer_start](03-features/06-app-lifecycle.md#customer_start) command. Only `guards` will be launched in the process:

![Diagram](/img/router/rehydrate-client.drawio.svg)

:::info

Router will run page actions (failed on server or client-side only) at [clear](03-features/06-app-lifecycle.md#clear) stage.

:::

## Client SPA navigation

All client navigations with SPA router have a lifecycle, similar to server-side flow. Router `hooks` and `guards` will be launched in the process:

![Diagram](/img/router/navigate-flow-client-spa.drawio.svg)

:::info

Router will run `commandLineRunner` stages `resolve_user_deps`, `resolve_page_deps` and `spa_transition` sequentially at `beforeNavigate` hook, and stage `after_spa_transition` on `afterNavigate` hook.

And as you can see, actions behaviour depends on `SPA actions mode`. This mode allows you to control when to execute actions - before target page rendering or after. More information about SPA Mode in [Documentation how to change SPA actions mode](03-features/07-routing/09-how-to.md#setting-when-actions-should-be-performed-during-spa-transitions)

:::

## Client NoSPA navigation

This flow is simple - just a hard reload for any navigations:

![Diagram](/img/router/navigate-flow-client-no-spa.drawio.svg)

## Router tapable hooks

:::warning

Use tapable hooks only when deep customization or complete monitoring is required!

Do not confuse with [Router Hooks](03-features/07-routing/05-hooks-and-guards.md), which is simpler abstration over tapable hooks.

:::

Router provides a set of tapable hooks which can be useful for monitoring:
- `Router.hooks.beforeResolve`
- `Router.hooks.beforeNavigate`
- `Router.hooks.afterNavigate`
- `Router.hooks.beforeUpdateCurrent`
- `Router.hooks.afterUpdateCurrent`
- `Router.guards`
- `Router.syncHooks.change`
- `Router.navigateHook`
- `Router.runNavigateHook`
- `Router.updateHook`
- `Router.runUpdateHook`
- `Router.redirectHook`
- `Router.notfoundHook`
- `Router.blockHook`

### Navigation hooks

Navigation hooks are called when `Router.navigate` method executed.

Visualized navigation hooks flow:

![Navigation hooks](/img/router/hooks.navigate.drawio.svg)

### Route update hooks

Navigation hooks are called when `Router.updateCurrentRoute` method executed.

Visualized route update hooks flow:

![Route update hooks](/img/router/hooks.update.drawio.svg)

### How to use hooks

First, you need to create a Router Plugin and provide it with `ROUTER_PLUGIN` token:

```ts
import { COMMAND_LINE_RUNNROUTER_PLUGINER_PLUGIN } from '@tramvai/tokens-router';

const provider = provide({
  provide: ROUTER_PLUGIN,
  useFactory: () => {
    return {
      apply(router) {},
    };
  },
});
```

Method `apply` will be called right in the end of Router initialization.

Then, you can use hooks, for example to monitor navigation execution:

```ts
import { COMMAND_LINE_RUNNROUTER_PLUGINER_PLUGIN } from '@tramvai/tokens-router';

const provider = provide({
  provide: ROUTER_PLUGIN,
  useFactory: () => {
    return {
      apply(router) {
        router.navigateHook.wrap(async (_, payload, next) => {
          const { navigateOptions } = payload;
          const url = typeof navigateOptions === 'string' ? navigateOptions : navigateOptions.url;
          let start = Date.now();

          console.log(`navigation to "${url}" is started`);

          await next(payload);

          console.log(`navigation to "${url}" is finished, duration:`, Date.now() - start);
        });
      },
    };
  },
});
```
