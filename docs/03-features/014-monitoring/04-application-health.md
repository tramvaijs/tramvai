---
id: application-health
title: Application Health
---

## Overview

Tramvai application's health and performance monitoring. It monitors critical lifecycle events from HTML parsing through app initialization and rendering, capturing errors and performance metrics along the way.

### Monitored Events

| Event | Description | Trigger Point |
| --- | --- | --- |
| `html-opened` | HTML document parsed and ready | Document parse complete |
| `assets-loaded` | All critical assets loaded successfully | Window load event |
| `assets-load-failed` | One or more critical assets failed to load | Window load event (with errors) |
| `app:initialized` | Application initialization complete | After 'init' command line |
| `app:initialize-failed` | Application failed to initialize | App init error |
| `app:rendered` | Application rendered successfully | After successful app render |
| `react:render` | React rendered successfully | After successful react render |
| `react:error` | React rendered with error | The error occure while react hydration, it can be uncaughtError,caughtError or recoverableError |
| `app:render-failed` | Application rendering failed | Error boundary or renderer callback |

| `unhandled-error` | Unhandled promise rejection | Global unhandledrejection event |

:::info

When a `react:error` occurs, an `app:render-failed` event is also emitted automatically. If you subscribe to both hooks, be aware that you may receive duplicate notifications for the same error.

:::

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

Inline reporter are used to capture lifecycle events and send them to a monitoring service (like an analytics tool or error logger). Inline reporters are injected into the HTML during server-side rendering. This allows to detect errors and performance issues early, even before the app is fully up and running.

Key Events Sent Through Inline Reporters:

- **HTML Opened** (`html-opened`): Tracks when the HTML is parsed and ready.
- **Assets Loaded** (`assets-loaded`) / Assets Load Failed (`**assets-load-failed**`): Tracks the success/failure of loading assets (JS, CSS, etc.).
- **App Start Failed** (`app-start-failed`): Tracks initialization errors.
- **Unhandled Errors** (`unhandled-error`): Tracks unhandled errors or promise rejections.

The module requires an inline reporter factory to send events to your monitoring service. To do this provide `INLINE_REPORTER_FACTORY_SCRIPT_TOKEN` using inline script

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

### How to configure monitoring for main Tramvai events

There is a possibility to monitor the main events that occur while the Tramvai application is being initialized. Here is a list of these events:

- `app:initialized`
- `app:initialize-failed`
- `app:rendered`
- `app:render-failed`
- `react:render`
- `react:error`

When you are using ApplicationMonitoringModule, these events are sent to your remote logger by default. But in some cases, you will need custom metrics. Here is an example of how to do this:

```typescript
import { provide } from '@tramvai/core';
import { TRAMVAI_HOOKS_TOKEN, commandLineListTokens } from '@tramvai/core';
import { sendMonitoringLogs } from './sendMonitoringLogs';

const providers = [
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ tramvaiHooks }) => {
      hooks['app:initialized'].tap('app-init', () => {
        sendMonitoringLogs({ event: 'app-initialized' });
      });
      hooks['app:initialize-failed'].tap('app-init-failed', (_, { error }) => {
        sendMonitoringLogs({ event: 'app-initialize-failed', level: 'ERROR', error });
      });
      hooks['app:rendered'].tap('app-rendered', () => {
        sendMonitoringLogs({ event: 'app-rendered' });
      });
      hooks['app:render-failed'].tap('app-render-failed', (_, { error }) => {
        sendMonitoringLogs({ event: 'app-render-failed', level: 'ERROR', error });
      });

      hooks['react:render'].tap('react-render', () => {
        sendMonitoringLogs({ event: 'react-render' });
      });

      hooks['react:error'].tap('react-error', (_, { error }) => {
        sendMonitoringLogs({ event: 'react-error', level: 'ERROR', error });
      });
    },
    deps: {
      tramvaiHooks: TRAMVAI_HOOKS_TOKEN,
    },
  }),
];
```

## How It Works

### Server-Side

1. **Inline Scripts Injection**: The module injects monitoring scripts into the HTML `<head>` during server-side rendering
2. **Early Monitoring**: Scripts execute immediately to catch early errors and events
3. **Reporter Initialization**: The inline reporter factory creates a global reporter instance
4. **Hook Registration**: Server-side hooks are registered to track initialization events

### Client-Side

1. **HTML Opened**: First script executes when HTML is parsed
2. **Asset Monitoring**: Error listeners track script/link loading failures
3. **App Creation**: Monitors unhandled errors during app bootstrap
4. **Initialization**: Tracks when app completes initialization
5. **Rendering**: Integrates with error boundaries and renderer callbacks

### Event Flow

```
HTML Parse → html-opened
    ↓
Asset Loading → assets-loaded / assets-load-failed
    ↓
App Bootstrap → app-start-failed (on error)
    ↓
App Init → app-initialized
    ↓
App Render → app-rendered / app-render-failed
    ↓
Runtime → unhandled-error (if occurs)
```
