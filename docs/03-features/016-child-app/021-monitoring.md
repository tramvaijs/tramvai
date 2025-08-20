## Child App Lifecycle Plugins

This document describes how to monitor the lifecycle of child-apps using dedicated lifecycle plugins. These plugins allow developers to observe, log, and extend child-app behavior at key stages — such as loading, mounting, and prefetching — providing a centralized mechanism for child-app monitoring and integration.

### Overview

The system provides a set of plugin tokens through which you can observe and extend the lifecycle of child-apps. These plugins receive a `hooks` object with Tapable hook instances that can be wrapped to track or customize behavior during stages such as preload, load, mount, and configuration.

These plugins are suitable for advanced use cases such as:

- Observing and logging lifecycle events (e.g., preload, prefetch, mount)
- Extending child-app configuration resolution
- Retrying loading logic
- Measuring render performance

---

### Hook Groups and Tokens

Hooks are grouped and exposed through the following plugin tokens:

- `CHILD_APP_PRELOAD_MANAGER_PLUGIN`: Hooks related to preload, prefetch behavior, and command line execution
- `CHILD_APP_LOADER_PLUGIN`: Hooks related to loading the child-app assets (JS, CSS and stats JSON files)
- `CHILD_APP_CONFIG_RESOLUTION_PLUGIN`: Hooks related to resolving external configuration for child-apps
- `CHILD_APP_RENDER_PLUGIN`: Hooks related to rendering and mount status

---

### Preload & Prefetch Hooks

Token: `CHILD_APP_PRELOAD_MANAGER_PLUGIN`

Hooks available:

| Hook Name              | Type             | Description                                     |
| ---------------------- | ---------------- | ----------------------------------------------- |
| preloadChildApp        | AsyncTapableHook | Fires when a child-app is preloaded             |
| prefetchChildApp       | AsyncTapableHook | Fires when a child-app is prefetched            |
| runChildAppCommandLine | AsyncTapableHook | Fires when a child-app command-line is executed |

```ts
export type RunChildAppCommandLineArgs = {
  config: ChildAppFinalConfig;
  status: string; // possible values: customer, clear
  line: keyof CommandLines; // possible values: server, client
};

export type ChildAppPreloadHooks = {
  preloadChildApp: AsyncTapableHookInstance<PreloadArgs, undefined | ChildAppFinalConfig>;
  prefetchChildApp: AsyncTapableHookInstance<PreloadArgs>;
  runChildAppCommandLine: AsyncTapableHookInstance<RunChildAppCommandLineArgs>;
};
```

#### Example: Logging Preload and Prefetch Events

```ts
import { LOGGER_TOKEN } from '@tramvai/tokens-common';

export const logPreloadPlugin = {
  provide: CHILD_APP_PRELOAD_MANAGER_PLUGIN,
  useFactory: ({ logger }) => {
    const log = logger('child-app:preload');

    return {
      apply(hooks) {
        hooks.preloadChildApp.wrap(async (_, payload, next) => {
          log.info({ event: 'child-app-preload', name: payload.config.name });
          return next(payload);
        });

        hooks.prefetchChildApp.wrap(async (_, payload, next) => {
          log.info({ event: 'child-app-prefetch', name: payload.config.name });
          return next(payload);
        });

        hooks.runChildAppCommandLine.wrap(async (_, payload, next) => {
          // example: log customer line on server
          if (payload.status === 'customer' && typeof window === 'undefined') {
            log.info({ event: 'child-app-customer-command-line-run', name: payload.config.name });
          }

          const result = await next(payload);
          return result;
        });
      },
    };
  },
  deps: {
    logger: LOGGER_TOKEN,
  },
};
```

---

### Loader Hooks

Token: `CHILD_APP_LOADER_PLUGIN`

> Note: Plugins registered under CHILD_APP_LOADER_PLUGIN must use Scope.SINGLETON. This is because the loader itself operates as a singleton and the plugin must match that scope to function correctly. Registering it with another scope may lead to unexpected behavior.

Hooks available:

| Hook Name  | Type             | Description                                   |
| ---------- | ---------------- | --------------------------------------------- |
| loadModule | AsyncTapableHook | Fires when a child-app module is being loaded |

#### Example: Retry Logic for Load Failure

```ts
export const retryLoadPlugin = {
  provide: CHILD_APP_LOADER_PLUGIN,
  scope: Scope.SINGLETON,
  useFactory: () => {
    return {
      apply(hooks) {
        hooks.loadModule.wrap(async (_, payload, next) => {
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts < maxAttempts) {
            try {
              return await next(payload);
            } catch (error) {
              attempts++;
              if (attempts >= maxAttempts) throw error;
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        });
      },
    };
  },
};
```

---

### Config Resolution Hooks

Token: `CHILD_APP_CONFIG_RESOLUTION_PLUGIN`

Hooks available:

| Hook Name   | Type             | Description                                          |
| ----------- | ---------------- | ---------------------------------------------------- |
| fetchConfig | AsyncTapableHook | Fires when resolving external config for a child-app |

#### Example: Extend External Config

```ts
export const extendConfigPlugin = {
  provide: CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
  useFactory: () => {
    return {
      apply(hooks) {
        hooks.fetchConfig.wrap(async (_, payload, next) => {
          const [original, extension] = await Promise.all([next(payload), fetchExtraConfig()]);

          return [...original, ...extension];
        });
      },
    };
  },
};
```

---

### Render Hooks

Token: `CHILD_APP_RENDER_PLUGIN`

Hooks available:

| Hook Name   | Type            | Description                                        |
| ----------- | --------------- | -------------------------------------------------- |
| mounted     | SyncTapableHook | Fires after the child-app is mounted on the client |
| mountFailed | SyncTapableHook | Fires after fallback is mounted on error           |

#### Example: Logging Mount Events

```ts
import { LOGGER_TOKEN } from '@tramvai/tokens-common';

export const logRenderPlugin = {
  provide: CHILD_APP_RENDER_PLUGIN,
  useFactory: ({ logger }) => {
    const log = logger('child-app:render');

    return {
      apply(hooks) {
        hooks.mounted.tap('logMounted', ({ name, version, tag }) => {
          log.info({ event: 'child-app-mounted', name, version, tag });
        });

        hooks.mountFailed.tap('logMountFailed', ({ name, version, tag }) => {
          log.error({ event: 'child-app-mount-failed', name, version, tag });
        });
      },
    };
  },
  deps: {
    logger: LOGGER_TOKEN,
  },
};
```

---

### Summary

To extend the behavior of child-apps throughout their lifecycle:

1. Implement a plugin object with an `apply(hooks)` method
2. Use `.wrap` for async hooks and `.tap` for sync hooks
3. Register your plugin under the appropriate token with `multi: true`

---
