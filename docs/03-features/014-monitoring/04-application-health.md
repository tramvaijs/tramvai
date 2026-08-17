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
| `critical-assets-loaded` | All critical assets loaded successfully | Window load event |
| `critical-assets-load-failed` | One or more critical assets failed to load | Window load event |
| `app-start-failed` | Application failed to start | Window error event |
| `asset-load-failed` | Any critical JS or CSS asset failed to load | Window error event |
| `unhandled-error` | Unhandled error | Window error event |
| `unhandled-rejection` | Unhandled promise rejection | Window unhandledrejection event |

#### Tramvai hooks (server and browser)

| Hook                     | Description                         |
| ------------------------ | ----------------------------------- |
| `app:initialize-started` | Application initialization started  |
| `app:initialized`        | Application initialization complete |
| `app:initialize-failed`  | Application failed to initialize    |
| `app:render-started`     | Application render started          |
| `app:rendered`           | Application rendered successfully   |
| `app:render-failed`      | Application rendering failed        |
| `react:render-started`   | React render started                |
| `react:render`           | React render lifecycle event        |
| `react:error`            | React error occurred during render  |

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
import { TramvaiRetryAssetsModule } from '@tramvai/module-render';
import { ApplicationMonitoringModule } from '@tramvai/module-application-monitoring';

createApp({
  name: 'my-app',
  modules: [
    // this module and assets retry script is essential for monitoring failed critical assets events
    TramvaiRetryAssetsModule,
    ApplicationMonitoringModule,
  ],
});
```

### 2. Extend the Inline Reporter

The inline reporter is `window.__TRAMVAI_INLINE_REPORTER` — a small dispatcher injected into the HTML during server-side rendering, before the app's DI container or hydration even start. This allows detecting errors and performance issues early, even before the app is fully up and running. It exposes:

- `send(eventName, payload)` — called internally by this module (and other tramvai modules) whenever a monitored event happens (see the event table above).
- `registerTransport(transportFactory)` — plug in your own transport: a function that receives every event and does something with it (e.g. send it to your monitoring backend).
- `registerExtension(extensionFactory)` — plug in a function that enriches every event's payload before it reaches transports (e.g. add a device id).

`registerTransport`/`registerExtension` are the recommended way to receive events. Each is its own small, independent `<script>` tag that registers itself as a side effect — unrelated modules or teams can each add their own without knowing about each other or touching a shared factory.

Key Events Sent Through the Inline Reporter:

- **HTML Opened** (`html-opened`): Tracks when the HTML is parsed and ready.
- **Critical Assets Loaded** (`critical-assets-loaded`) / **Critical Assets Load Failed** (`critical-assets-load-failed`): Tracks the success/failure of loading critical assets (JS, CSS) on page loading, one event per page session.
- **App Start Failed** (`app-start-failed`): Tracks initialization errors.
- **Asset Load Failed** (`asset-load-failed`): Tracks all failed critical assets (JS, CSS), one event per asset.
- **Unhandled Errors** (`unhandled-error`): Tracks unhandled errors.
- **Unhandled Promise Rejections** (`unhandled-rejection`): Tracks unhandled promise rejections.

#### Transports

Provide `INLINE_REPORTER_TRANSPORTS_TOKEN` (`multi: true`) with a **factory function** — it receives `InlineReporterParameters` (see below) and must return the actual transport, `(eventName, payload) => void`:

```typescript title="myTransport.inline.ts"
export function myTransportFactory(parameters) {
  return function myTransport(eventName, payload) {
    fetch('/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, ...parameters, ...payload }),
    });
  };
}
```

```typescript
import { provide } from '@tramvai/core';
import { INLINE_REPORTER_TRANSPORTS_TOKEN } from '@tramvai/module-application-monitoring';
import { myTransportFactory } from './myTransport.inline';

provide({
  provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
  multi: true,
  useValue: myTransportFactory,
});
```

`.inline.ts` files are transpiled separately and serialized via `Function.prototype.toString()` straight into a `<script>` tag — they cannot use imports or close over anything outside their own function body.

If two events both end up going to the same backend (e.g. the same analytics project), keep them as **one** transport rather than splitting artificially — one file, one HTTP client setup, one place to reason about that backend's contract. Split into separate transports only when the _destinations_ are genuinely different (e.g. one team's analytics service vs. another team's error tracker).

#### Extensions

Provide `INLINE_REPORTER_EXTENSIONS_TOKEN` (`multi: true`) the same way — a factory returning `(eventName, payload) => payload`. Extensions run in registration order, each receiving the payload the previous one produced; their result is what every transport ultimately gets:

```typescript title="myExtension.inline.ts"
export function myExtensionFactory() {
  return function myExtension(eventName, payload) {
    if (eventName !== 'html-opened') {
      // not relevant to this extension - return the payload unchanged
      return payload;
    }

    return { ...payload, deviceId: getDeviceId() };
  };
}
```

```typescript
import { provide } from '@tramvai/core';
import { INLINE_REPORTER_EXTENSIONS_TOKEN } from '@tramvai/module-application-monitoring';
import { myExtensionFactory } from './myExtension.inline';

provide({
  provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
  multi: true,
  useValue: myExtensionFactory,
});
```

Use an extension when the same enrichment is needed by two or more independent transports (e.g. a device id that both your analytics transport and your error-tracking transport want). If only one transport ever needs a piece of data, compute it as a private helper inside that transport instead — promoting it to an extension is unnecessary indirection until a second consumer actually shows up.

#### Two transport-authoring styles

- **Allow-list `switch`** — for backends with a strict event schema, list only the events you actually forward and ignore the rest:

  ```typescript
  function myTransport(eventName, payload) {
    switch (eventName) {
      case 'html-opened':
        sendToBackend('page-view', payload);
        break;
      case 'unhandled-error':
        sendToBackend('js-error', payload);
        break;
    }
  };
  ```

- **Forward by default** — for free-form sinks (e.g. a generic log collector) that don't need an explicit mapping per event:

  ```typescript
  function myTransport(eventName, payload) {
    sendToBackend({ event: eventName, ...payload });
  };
  ```

Pick whichever matches your backend — there's no need for the two-step "call `send()`, then remember to add a `case` for it" friction if your backend accepts arbitrary event names.

#### Escape hatch: fully replace the reporter

If you need full control over `send()`/registration behavior, or aren't using transports/extensions at all, override `INLINE_REPORTER_FACTORY_SCRIPT_TOKEN` (**not** `multi`) — whichever factory is provided here entirely replaces the built-in dispatcher, including its `registerTransport`/`registerExtension` methods. Implement those yourself if you still want other modules' transports/extensions to keep working:

```typescript title="inlineReporter.inline.ts"
export function inlineReporterFactoryScript(parameters) {
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
    useValue: inlineReporterFactoryScript,
  }),
];
```

## Configuration

### Tokens

#### INLINE_REPORTER_PARAMETERS_TOKEN

`multi: true` — the module already provides one default entry (`appName`/`appRelease`/`appVersion`), and every other entry contributed by any module gets shallow-merged with it (`Object.assign({}, ...entries)`) into a single object passed to every transport/extension factory. Add your **own** entry with the fields you own, rather than overriding the whole object:

```typescript
import { provide } from '@tramvai/core';
import { INLINE_REPORTER_PARAMETERS_TOKEN } from '@tramvai/module-application-monitoring';

provide({
  provide: INLINE_REPORTER_PARAMETERS_TOKEN,
  multi: true,
  useFactory: ({ envManager }) => {
    return {
      environment: envManager.get('NODE_ENV'),
      region: envManager.get('DEPLOY_REGION'),
    };
  },
  deps: {
    envManager: ENV_MANAGER_TOKEN,
  },
});
```

### Monitoring with Tramvai hooks

When you are using `ApplicationMonitoringModule`, if you want to monitor application lifecycle events, you can subscribe to hooks directly. Server and browser have different `react:render` and `react:error` events, so subscriptions should be separated.

#### Server-side example

Server-side render monitoring hooks work with all `REACT_SERVER_RENDER_MODE` values, but in `blocking` or `streaming` hook `react:render` will be called twice (for `onShellReady` and `onAllReady` callbacks), because both modes use the [renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) API. Despite this, the sending of the `app:render` event is deduplicated and called only for `onAllReady` callback.

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

### Server-Side

The server uses `renderToPipeableStream` in blocking and streaming modes, and `renderToString` by default. React provides four callbacks during rendering, and the module maps them to tramvai hooks:

#### `react:render-started` events

The `react:render-started` hook is called just before SSR rendering started.

#### `react:render` events

| `payload.event` | React callback | Description |
| --- | --- | --- |
| `ssr:on-shell-ready` | `onShellReady` | The shell HTML (everything outside pending `<Suspense>` boundaries) is ready. |
| `ssr:on-all-ready` | `onAllReady` | All content including Suspense boundaries is ready. HTML is piped to the response after this. Triggers `app:rendered`. |
| `ssr:finished` | after sync `renderToString` call | The full HTML is ready. Triggers `app:rendered`. |

#### `react:error` events

| `payload.event` | React callback | Description |
| --- | --- | --- |
| `ssr:on-error` | `onError` | Recoverable error inside a `<Suspense>` boundary. The Suspense fallback is rendered, page still returns 200. Does **not** trigger `app:render-failed`. |
| `ssr:on-shell-error` | `onShellError` | Fatal error outside any `<Suspense>` boundary. The render is aborted, server returns 500. Triggers `app:render-failed`. |

#### Derived hooks

- `app:render-started` — called automatically when `react:render-started` fires
- `app:rendered` — called automatically when `react:render` fires with `ssr:on-all-ready` or `ssr:finished`
- `app:render-failed` — called automatically when `react:error` fires with `ssr:on-shell-error`

#### Event flow

##### Initialization

`app:initialized` always fires before `app:rendered`, once per application lifecycle, after "init" Command line ("init" -> "listen")

##### Rendering

All rendering-related events are fired per every incoming request for HTML pages.

For streaming and blocking render modes:

```
renderToPipeableStream
  ├─ before        → react:render-started               → app:render-started
  ├─ onShellReady  → react:render (ssr:on-shell-ready)
  ├─ onAllReady    → react:render (ssr:on-all-ready)    → app:rendered
  ├─ onError       → react:error  (ssr:on-error)        [recoverable, no app:render-failed]
  └─ onShellError  → react:error  (ssr:on-shell-error)  → app:render-failed → 500
```

And for default mode:

```
renderToString
  ├─ before → react:render-started → app:render-started
  ├─ then   → react:render (ssr:finished) → app:rendered
  └─ catch  → react:error  (ssr:on-error) → app:render-failed → 500
```

### Client-Side (hydration)

The browser implementation monitors React hydration errors and error boundaries.

#### `react:render-started` events

The `react:render-started` hook is called just before hydration started.

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

- `app:render-started` — called automatically when `react:render-started` fires
- `app:rendered` — called automatically on the first `react:render` (successful hydration)
- `app:render-failed` — called automatically when `react:error` fires with `page-error-boundary`, `hydrate:on-uncaught-error`, or `hydrate:failed`

:::info

When a `react:error` triggers `app:render-failed`, subscribing to both hooks will result in duplicate notifications for the same error.

:::

#### Event flow

##### Initialization

`app:initialized` always fires after `app:rendered`, once per application lifecycle, and includes full client initialization cycle:

- "init" and "listen" Command lines
- "customerStart", "resolveUserDeps", "resolvePageDeps", "generatePage" and "clear" Command lines

##### Rendering

All rendering-related events are fired once per application lifecycle, at "generatePage" Command line stage.

```
HTML Parse → html-opened
    ↓
Asset Loading → asset-load-failed / (critical-assets-loaded | critical-assets-load-failed)
    ↓
App Bootstrap → app-start-failed (on error)
    ↓
App Init → app:initialize-started / app:initialize-failed
    ↓
Command line "init"
    ↓
Command line "customer"
    ↓
Hydration → react:render-started → app:render-started
         → react:render → app:rendered
         or react:error  → app:render-failed
    ↓
App Initialized → app:initialized / app:initialize-failed
    ↓
Runtime → unhandled-error / unhandled-rejection (if occurs)
```
