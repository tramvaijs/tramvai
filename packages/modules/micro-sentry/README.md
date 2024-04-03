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

## Exported tokens

#### `MICRO_SENTRY_INSTANCE_TOKEN`

Ready to use instance of micro-sentry

### `MICRO_SENTRY_OPTIONS_TOKEN`

Configuration options for micro-sentry
