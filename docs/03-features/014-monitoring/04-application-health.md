---
id: application-health
title: Application Health
---

## Overview

Tramvai application's health and performance monitoring. It monitors critical lifecycle events from HTML parsing through app initialization and rendering, capturing errors and performance metrics along the way.

The module has separate server and browser implementations with different `react:render` and `react:error` event semantics on each side.

### Monitored Events

#### Inline reporter events (browser)

| Event | Description | Trigger Point |
| --- | --- | --- |
| `html-opened` | HTML document parsed and ready | Document parse complete |
| `assets-loaded` | All critical assets loaded successfully | Window load event |
| `assets-load-failed` | One or more critical assets failed to load | Window load event (with errors) |
| `unhandled-error` | Unhandled promise rejection | Global unhandledrejection event |

#### Tramvai hooks (server and browser)

| Hook                    | Description                         |
| ----------------------- | ----------------------------------- |
| `app:initialized`       | Application initialization complete |
| `app:initialize-failed` | Application failed to initialize    |
| `app:rendered`          | Application rendered successfully   |
| `app:render-failed`     | Application rendering failed        |
| `react:render`          | React render lifecycle event        |
| `react:error`           | React error occurred during render  |

## Installation

```bash
npm install @tramvai/module-application-monitoring
```

Or with yarn:

```bash
yarn add @tramvai/module-application-monitoring
```

## Basic Usage

### 1. Register the Module

Add the module to your Tramvai application:

```typescript
import { createApp } from '@tramvai/core';
import { ApplicationMonitoringModule } from '@tramvai/module-application-monitoring';

createApp({
  name: 'my-app',
  modules: [ApplicationMonitoringModule],
});
```

### 2. Provide an Inline Reporter Factory

Inline reporter is used to capture lifecycle events and send them to a monitoring service (like an analytics tool or error logger). Inline reporter is injected into the HTML during server-side rendering. This allows detecting errors and performance issues early, even before the app is fully up and running.

Key Events Sent Through Inline Reporters:

- **HTML Opened** (`html-opened`): Tracks when the HTML is parsed and ready.
- **Assets Loaded** (`assets-loaded`) / **Assets Load Failed** (`assets-load-failed`): Tracks the success/failure of loading assets (JS, CSS, etc.).
- **App Start Failed** (`app-start-failed`): Tracks initialization errors.
- **Unhandled Errors** (`unhandled-error`): Tracks unhandled errors or promise rejections.

The module requires an inline reporter factory to send events to your monitoring service. To do this, provide `INLINE_REPORTER_FACTORY_SCRIPT_TOKEN` using an inline script.

```typescript title="inlineReporter.inline.ts"
export function inlineReporterFactoryScript() {
  return {
    send(eventName, payload) {
      fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          ...parameters,
          ...payload,
          timestamp: Date.now(),
        }),
      });
    },
  };
}
```

```typescript
import { provide } from '@tramvai/core';
import { INLINE_REPORTER_FACTORY_SCRIPT_TOKEN } from '@tramvai/module-application-monitoring';
import { inlineReporterFactoryScript } from './inlineReporter.inline';

const providers = [
  provide({
    provide: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
    useFactory: () => {
      return inlineReporterFactoryScript;
    },
  }),
];
```

## Configuration

### Tokens

#### INLINE_REPORTER_PARAMETERS_TOKEN

**Example: Adding Custom Parameters**

```typescript
import { provide } from '@tramvai/core';
import { INLINE_REPORTER_PARAMETERS_TOKEN } from '@tramvai/module-application-monitoring';

provide({
  provide: INLINE_REPORTER_PARAMETERS_TOKEN,
  useFactory: ({ appInfo, envManager }) => {
    return {
      appName: appInfo.appName,
      appRelease: envManager.get('APP_RELEASE'),
      appVersion: envManager.get('APP_VERSION'),
      environment: envManager.get('NODE_ENV'),
      region: envManager.get('DEPLOY_REGION'),
    };
  },
  deps: {
    envManager: ENV_MANAGER_TOKEN,
    appInfo: APP_INFO_TOKEN,
  },
});
```

### Monitoring with Tramvai hooks

When you are using `ApplicationMonitoringModule`, if you want to monitor application lifecycle events, you can subscribe to hooks directly. Server and browser have different `react:render` and `react:error` events, so subscriptions should be separated.

#### Server-side example

Server-side render monitoring hooks work with `REACT_SERVER_RENDER_MODE` set to `blocking` or `streaming`, because both modes use the [renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) API.

In `blocking` mode, the full HTML response is still buffered and works like the old `renderToString` API, and it is a much simpler way to move to the streaming rendering API. In `streaming` mode, a lot more changes are present that can be breaking for your application — `async` scripts, different hydration trigger, etc.

:::warning

We recommend paying attention to the following points when using the new `blocking` rendering mode:

- `renderToPipeableStream` can have worse performance than `renderToString`, SSR throughput can be lower by 5-10% - check [server metrics](03-features/014-monitoring/02-metrics.md) after release
- any unresolved `Suspense` boundaries will delay the response, make sure that you don't use [Deferred Actions](03-features/09-data-fetching/06-streaming-data.md) or features like library-internal `Suspense` integrations (e.g. [@tanstack/query](https://tanstack.com/query/v5/docs/framework/react/guides/suspense)); or switch to [`streaming` rendering mode](03-features/010-rendering/06-streaming.md) with full benefits of streaming rendering; or adjust a reasonable `REACT_STREAMING_RENDER_TIMEOUT` value

:::

```typescript
import { provide, commandLineListTokens, TRAMVAI_HOOKS_TOKEN } from '@tramvai/core';
import { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';
import { sendMonitoringLogs } from './sendMonitoringLogs';

const providers = [
  provide({
    provide: REACT_SERVER_RENDER_MODE,
    useValue: 'blocking',
  }),
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ tramvaiHooks }) => {
      return () => {
        tramvaiHooks['react:render'].tap('my-monitoring', (_, payload) => {
          if (payload.event === 'ssr:on-shell-ready') {
            sendMonitoringLogs({ event: 'ssr-shell-ready' });
          }
        });

        tramvaiHooks['react:error'].tap('my-monitoring', (_, { event, error }) => {
          if (event === 'ssr:on-shell-error') {
            sendMonitoringLogs({ event: 'ssr-fatal-error', error });
          }
          if (event === 'ssr:on-error') {
            sendMonitoringLogs({ event: 'ssr-recoverable-error', error });
          }
        });
      };
    },
    deps: {
      tramvaiHooks: TRAMVAI_HOOKS_TOKEN,
    },
  }),
];
```

#### Browser-side example

```typescript
import { provide, commandLineListTokens, TRAMVAI_HOOKS_TOKEN } from '@tramvai/core';
import { sendMonitoringLogs } from './sendMonitoringLogs';

provide({
  provide: commandLineListTokens.init,
  useFactory: ({ tramvaiHooks }) => {
    return () => {
      tramvaiHooks['app:initialized'].tap('my-monitoring', () => {
        sendMonitoringLogs({ event: 'app-initialized' });
      });
      tramvaiHooks['app:rendered'].tap('my-monitoring', () => {
        sendMonitoringLogs({ event: 'app-rendered' });
      });
      tramvaiHooks['app:render-failed'].tap('my-monitoring', (_, { error }) => {
        sendMonitoringLogs({ event: 'app-render-failed', error });
      });

      tramvaiHooks['react:error'].tap('my-monitoring', (_, { event, error }) => {
        sendMonitoringLogs({ event: `react-error:${event}`, error });
      });
    };
  },
  deps: {
    tramvaiHooks: TRAMVAI_HOOKS_TOKEN,
  },
});
```

## How It Works

### Server-Side (blocking render mode)

The server uses `renderToPipeableStream` in blocking mode. React provides four callbacks during rendering, and the module maps them to tramvai hooks:

#### `react:render` events

| `payload.event` | React callback | Description |
| --- | --- | --- |
| `ssr:on-shell-ready` | `onShellReady` | The shell HTML (everything outside pending `<Suspense>` boundaries) is ready. |
| `ssr:on-all-ready` | `onAllReady` | All content including Suspense boundaries is ready. HTML is piped to the response after this. Triggers `app:rendered`. |

#### `react:error` events

| `payload.event` | React callback | Description |
| --- | --- | --- |
| `ssr:on-error` | `onError` | Recoverable error inside a `<Suspense>` boundary. The Suspense fallback is rendered, page still returns 200. Does **not** trigger `app:render-failed`. |
| `ssr:on-shell-error` | `onShellError` | Fatal error outside any `<Suspense>` boundary. The render is aborted, server returns 500. Triggers `app:render-failed`. |

#### Derived hooks

- `app:rendered` — called automatically when `react:render` fires with `ssr:on-shell-ready`
- `app:render-failed` — called automatically when `react:error` fires with `ssr:on-shell-error`

#### Event flow

```
renderToPipeableStream
  ├─ onShellReady  → react:render (ssr:on-shell-ready) → app:rendered
  ├─ onAllReady    → react:render (ssr:on-all-ready)
  ├─ onError       → react:error  (ssr:on-error)          [recoverable, no app:render-failed]
  └─ onShellError  → react:error  (ssr:on-shell-error)  → app:render-failed → 500
```

### Client-Side (hydration)

The browser implementation monitors React hydration errors and error boundaries.

#### `react:render` events

The `react:render` hook is called once after successful hydration.

#### `react:error` events

| `payload.event` | Description |
| --- | --- |
| `page-error-boundary` | Error caught by the page-level error boundary |
| `hydrate:on-uncaught-error` | Uncaught error during hydration |
| `hydrate:on-caught-error` | Error caught by an error boundary during hydration |
| `hydrate:recover-after-error` | Recoverable hydration error (mismatch), React re-rendered from scratch |
| `hydrate:failed` | Hydration threw synchronously |

#### Derived hooks

- `app:rendered` — called automatically on the first `react:render` (successful hydration)
- `app:render-failed` — called automatically when `react:error` fires with `page-error-boundary`, `hydrate:on-uncaught-error`, or `hydrate:failed`

:::info

When a `react:error` triggers `app:render-failed`, subscribing to both hooks will result in duplicate notifications for the same error.

:::

#### Event flow

```
HTML Parse → html-opened
    ↓
Asset Loading → assets-loaded / assets-load-failed
    ↓
App Bootstrap → app-start-failed (on error)
    ↓
App Init → app:initialized / app:initialize-failed
    ↓
Hydration → react:render → app:rendered
         or react:error  → app:render-failed
    ↓
Runtime → unhandled-error (if occurs)
```
