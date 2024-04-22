# Micro-sentry

Integration with [micro-sentry](https://github.com/taiga-family/micro-sentry).

## Installation

You need to install `@tramvai/module-micro-sentry`:

```bash
yarn add @tramvai/module-micro-sentry
```

And connect to the project: `TramvaiMicroSentryModule`:

```tsx
import { TramvaiMicroSentryModule } from '@tramvai/module-micro-sentry';

createApp({
  modules: [TramvaiMicroSentryModule],
});
```

And make sure to add `SENTRY_DSN` environment on deployed stands. Otherwise module will not work.

## Explanation

### Working with unhandled rejections and global errors

Micro-sentry itself does not have the proper logic to intercept global [unhandlerejection](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event) and [error](https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event) events. In this case, `@tramvai/module-micro-sentry` adds an inline script with custom logic for the `unhandledrejection` and `error` events. Before the micro-sentry package is initialized, all errors are added to an errorQueue, and when micro-sentry is initialized, this queue is cleared, and all caught errors are sent to the `SENTRY_DSN` URL. To create your custom global error handler, you can use the `MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN`. For example:

```ts
// createErrorInterceptor.inline.ts

export function createErrorInterceptor() {
  window.onerror = function () {
    // your custom logic
  };
  window.onunhandledrejection = function () {
    // your custom logic
  };
}
```

```ts
import { createApp } from '@tramvai/core';
import { TramvaiMicroSentryModule } from '@tramvai/module-micro-sentry';
import { createErrorInterceptor } from './createErrorInterceptor.inline';

createApp({
  name: 'sample-application',
  modules: [
    TramvaiMicroSentryModule,
    provide({
      provide: MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN,
      useFactory: ({ microSentryInlineErrorInterceptorKey }) => {
        return `(${createErrorInterceptor})()`;
      },
    }),
  ],
});
```

### Environment variables

Required:

- `SENTRY_DSN` - [DSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/) of the app

## How to

### Send custom error

```tsx
import { declareAction } from '@tramvai/core';
import { SENTRY_TOKEN } from '@tramvai/module-micro-sentry';
import { loadUsers } from './users';

export default declareAction({
  name: 'loadUsers',
  async fn() {
    try {
      await loadUsers();
    } catch (e) {
      microSentryClient.report(e);
      throw e;
    }
  },
  deps: {
    microSentryClient: MICRO_SENTRY_INSTANCE_TOKEN,
  },
});
```

## Environment variables

- `SENTRY_RELEASE` - application release version. The value is inserted into the `release` field for all errors
- `SENTRY_ENVIRONMENT` - the application environment where the error occurred. If the variable is not specified, then `process.env.NODE_ENV` is used

## Exported tokens

#### `MICRO_SENTRY_INSTANCE_TOKEN`

Ready to use instance of micro-sentry

### `MICRO_SENTRY_OPTIONS_TOKEN`

Configuration options for micro-sentry

### `MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_KEY_TOKEN`

Key value for ErrorInterceptor script. This key will be used to save custom logiс to window object.

### `MICRO_SENTRY_INLINE_ERROR_INTERCEPTOR_TOKEN`

Script for inline error interceptor
