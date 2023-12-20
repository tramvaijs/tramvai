---
id: logging
title: Logging
---

## Explanation

`tramvai` uses our internal powerful and flexible [@tinkoff/logger](references/libs/logger.md) library for universal logging both on server and client side.

Token `LOGGER_TOKEN` provides a [logger factory](#logger) with shared across all application basic configuration.

### Logger

`LOGGER_TOKEN` it is both a factory and a logger at the same time, but we recommend using it **only** as a factory, which will return [child loggers](references/libs/logger.md#child-loggers), because name passed to the factory will be added to the log object in `name` field. This key is used when you want to [show only necessary logs](#display-logs).

### Main concepts

- [Child loggers](references/libs/logger.md#child-loggers)
- [Logs filters](references/libs/logger.md#filter)
- [Logs extensions](references/libs/logger.md#extension)
- [Reporters](references/libs/logger.md#reporter)

### Available reporters

You can find all predefined reporters in [@tinkoff/logger](references/libs/logger.md#bundled-reporters) library documentation

## Usage

### Installation

The module is automatically installed and added with the @tramvai/module-common module.

### Configuration

#### Root logger

`LOGGER_INIT_HOOK` token is used to configure root logger (`LOGGER_TOKEN`) when it is created.

For example you want to add custom [extension](references/libs/logger.md#extension):

```ts
import { provide, Scope } from '@tramvai/core';
import { LOGGER_INIT_HOOK } from '@tramvai/tokens-common';

const provider = provide({
  provide: LOGGER_INIT_HOOK,
  scope: Scope.SINGLETON,
  useValue: (loggerInstance) => {
    loggerInstance.addExtension({
      extend(logObj: LogObj): LogObj {
        return {
          ...logObj,
          customField: 'customValue',
        };
      },
    });
  },
});
```

This extension will be applied to all child loggers, created from `LOGGER_TOKEN` factory.

#### Child logger

You can find child logger configuration example in [@tinkoff/logger](references/libs/logger.md#local-logger-configuration) library documentation

### Logging

You can get `LOGGER_TOKEN` from DI in components, actions and any other providers, for example:

```ts
import { declareAction } from '@tramvai/core';

const action = declareAction({
  name: 'myAction',
  async fn() {
    // create child logger with name 'my-action'
    const log = this.deps.logger('my-action');

    try {
      await doAsyncStuff();

      // { name: 'my-action', type: 'info', message: 'Action completed!', level, date }
      log.info('Action completed!');
    } catch (error) {
      // { name: 'my-action', type: 'error', event: 'failed', message: 'Action failed!', reason: Error, level, date }
      log.info({
        event: 'failed',
        message: 'Action failed!',
        reason: error,
      });
    }
  },
  deps: {
    logger: LOGGER_TOKEN,
  },
});
```

### Display logs

:::info

By default, on server all of the logs of level **warn** and above are enabled.

On the client in dev-mode all the logs of level **error** and above are enabled while in prod-mode all of the logs on client are disabled.

:::

Complete information about displaying logs can be found in [@tinkoff/logger](references/libs/logger.md#display-logs) library documentation.

#### Server logs

On server side logs behavior is controlled by envs `LOG_ENABLE` and `LOG_LEVEL`, e.g.:

```
LOG_LEVEL=info
LOG_ENABLE=route*
```

##### Change server logs settings in runtime

You can change this settings in runtime using papi-route `{app}/private/papi/logger`

Displaying of the logs is changed by query with the name `enable`, e.g.:

```
https://localhost:3000/{app}/private/papi/logger?enable=request.tinkoff
```

Level of the logs is change by query with the name `level`, e.g.:

```
https://localhost:3000/{app}/private/papi/logger?level=warn
```

To reset settings to default, based on env, use `mode=default`:

```
https://localhost:3000/{app}/private/papi/logger?mode=default
```

#### Client logs

On client side logs behavior can be changed by using `LOGGER_TOKEN` with the following methods - `logger.enable()` and `logger.setLevel()`

##### Change browser logs settings in runtime

`LOGGER_TOKEN` will be available in global variable - `window.logger`, so you can run the following code in browser console:

```js
logger.setLevel('info');
logger.enable('route*');
```

## How to

### How to see logs from the server in browser

This functionality is available only in dev-mode and can make development a little easier.

In browser console when loading page of the app the special log group with name `Tramvai SSR Logs` will be showed. If you open this group you will see logs from the server that was logged to this particular request. Herewith will be displayed only logs that are enabled for the [displaying on the server](#display-logs).

### How to see logs for the HTTP requests

:::info

Works only with [@tinkoff/request](https://tinkoff.github.io/tinkoff-request/)

:::

[http-client](references/modules/http-client.md) is already passes logger and its settings to the [log plugin](https://tinkoff.github.io/tinkoff-request/docs/plugins/log.html).

Plugin automatically generates names for loggers using template `request.${name}` that might be used to setting up [displaying of logs](#display-logs):

```ts
const provider = provide({
  provide: MY_HTTP_CLIENT,
  useFactory: ({ factory, envManager }) => {
    return factory({
      name: 'my-api-name',
      baseUrl: envManager.get('MY_API_URL'),
    });
  },
  deps: {
    factory: HTTP_CLIENT_FACTORY,
    envManager: ENV_MANAGER_TOKEN,
  },
});
```

As name of the logger equals to `my-api-name` to show logs:

- on server extend env `LOG_ENABLE: 'request.my-api-name'`
- on client call `logger.enable('request.my-api-name')`

### How to send logs to the API

:::info

It is implied that logs from the server are collected by the external tool that has access to the server console output and because of this logging to the external API from the server is not needed.

:::

For browser logs, you can send them to the API with [RemoteReporter](references/libs/logger.md#remotereporter).

For example, if we want to send logs with levels `error` and `fatal` to url declared in environment variable `FRONT_LOG_API`:

```ts
import { createToken, provide, Scope, APP_INFO_TOKEN } from '@tramvai/core';
import {
  ENV_USED_TOKEN,
  ENV_MANAGER_TOKEN,
  LOGGER_INIT_HOOK,
  LOGGER_REMOTE_REPORTER,
} from '@tramvai/tokens-common';
import { RemoteReporter } from '@tinkoff/logger';
import { isUrl } from '@tinkoff/env-validators';

const providers = [
  // provide new env variable with logs collector endpoint
  provide({
    provide: ENV_USED_TOKEN,
    useValue: [
      // use isUrl for validation
      { key: 'FRONT_LOG_API', dehydrate: true, validator: isUrl },
    ],
  }),
  // provide new remote reporter
  provide({
    provide: LOGGER_REMOTE_REPORTER,
    // we need only one instance of reporter
    scope: Scope.SINGLETON,
    useFactory: ({ appInfo, envManager, wuid }) => {
      const { appName } = appInfo;
      const logApi = envManager.get('FRONT_LOG_API');

      return new RemoteReporter({
        // number of parallel request
        requestCount: 1,
        // log levels which will be send to api
        emitLevels: { error: true, fatal: true },
        makeRequest(logObj) {
          return sendLog({
            logApi,
            // additional information for every reported logs
            payload: {
              ...logObj,
              appName,
              userAgent: window.navigator.userAgent,
              href: window.location.href,
            },
          });
        },
      });
    },
    deps: {
      appInfo: APP_INFO_TOKEN,
      envManager: ENV_MANAGER_TOKEN,
    },
  }),
];
```

### How to override emit level for remote logs?

When you are using `LOGGER_REMOTE_REPORTER`, all logs with default `remote` property always will be passed to remote reporter (meantime any other logs will be filtered by current emit level configured with `logger.setLevel` or `LOG_LEVEL` variables):

```ts
// remote has priority over RemoteReporter emitLevels
const log1 = logger({ name: 'test', defaults: { remote: true } });

// remote.emitLevels has priority over RemoteReporter emitLevels
const log2 = logger({ name: 'test', defaults: { remote: { emitLevels: { info: true } } } });

// send to API
log1.info('first');
log2.info('second');

// not sended to API
log2.trace('second');
```

### How to extend logs by user-specific data?

For example, you want to add `User-Agent` to all logs for concrete user.

Logger extensions registered in `LOGGER_INIT_HOOK` provider is not suitable for this case, because registration finishes early, at singletone scope, because of that request-specific providers are not available for this token at server-side.

It is not a problem for client code, but mostly we want to have one consistent way of extending logs.

For that, token `LOGGER_SHARED_CONTEXT` was created. At server-side, [AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#class-asynclocalstorage) is used, and a simple `Map` object at client-side.

```ts
import { commandLineListTokens, provide } from '@tramvai/core';
import { LOGGER_SHARED_CONTEXT } from '@tramvai/tokens-common';

const provider = provide({
  // first stage at server-side, where `asyncLocalStorage` context is available
  provide: commandLineListTokens.customerStart,
  useFactory: ({ loggerSharedContext, requestManager }) => {
    return function updateLoggerContext() {
      // depend of environment read UserAgent from request object or window.navigator
      const userAgent = typeof window === 'undefined'
        ? requestManager.getHeader('user-agent')
        : window.navigator.userAgent;

      // `userAgent` property will be added to all logs, sended after `customerStart` stage
      loggerSharedContext.set('userAgent', userAgent);
    };
  },
  deps: {
    loggerSharedContext: LOGGER_SHARED_CONTEXT,
    requestManager: REQUEST_MANAGER_TOKEN, 
  },
});
```

### How to properly format logs?

See [@tinkoff/logger](references/libs/logger.md#how-to-log-properly) library documentation
