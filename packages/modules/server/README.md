# Module Server

Core `tramvai` module, responsible for processing the users requests.

## Installation

You need to install `@tramvai/module-server`

```bash
npm i --save @tramvai/module-server
```

And connect to the project

```tsx
import { createApp } from '@tramvai/core';
import { ServerModule } from '@tramvai/module-server';

createApp({
  name: 'tincoin',
  modules: [ServerModule],
});
```

## Explanation

### Processing the users requests

`ServerModule` creates [express.js](https://expressjs.com/) application, handles user requests, runs [commandLineRunner](concepts/command-line-runner.md), and sends responses to users with data, headers and status from `RESPONSE_MANAGER_TOKEN` token.

### Request proxying

`ServerModule` allows you to configure the proxying of urls to the application using the library [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)

To enable proxying, create a file `proxy.conf.js` or `proxy.conf.json` in the root of the project to export the request mapping object, or you can use the `PROXY_CONFIG_TOKEN` token.

#### Proxy config format

##### Key-value object

```javascript
const testStand = 'https://example.org';

module.exports = {
  // The key is the path pattern for the `express` to be passed to `app.use`
  // value can be a string, in order to proxy all urls starting with `/login/`
  '/login/': testStand,
  // or can be a config object for [http-proxy](https://github.com/chimurai/http-proxy-middleware#http-proxy-options)
  '/test/': {
    target: testStand,
    auth: true,
    xfwd: true,
    ...
  }
};
```

##### Object with context and target properties

```javascript
module.exports = {
  // context - is similar to the option for [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#context-matching)
  context: ['/login/', '/registration/', '/auth/papi/'],
  target: 'https://example.org',
  // other `http-proxy-middleware` options
  changeOrigin: true,
};
```

##### Array with context and target properties

```json
[
  {
    "context": ["/a/", "/b/*/c/"],
    "target": "https://example.org"
  }
]
```

##### Implementation of the PROXY_CONFIG_TOKEN token

```tsx
import { Scope, provide } from '@tramvai/core';
import { PROXY_CONFIG_TOKEN } from '@tramvai/tokens-server';

[
  provide({
    provide: PROXY_CONFIG_TOKEN,
    scope: Scope.SINGLETON,
    useValue: {
      context: ['/a/', '/b/*/c/'],
      target: 'https://example.org',
    },
    multi: true,
  }),
];
```

### Serving static files

The `ServerModule` has a built-in static server that allows you to distribute static files to users.

To serve files, you need to create a directory `public` in the root of the project in which to place the necessary files. After that, all files will be available for request by browsers.

_For example, we want to distribute sw.js file from the project's root:_ for this we create a folder `public` in which we put the file `sw.js`. Now on the client side, we will be able to request data from the url http://localhost:3000/sw.js. Also, we will most likely need some modifications on the CI/CD side to copy the public folder to the stands.

This function is also available in production. For this purpose, copy the folder `public` into the docker container

:::caution

Module will not serve the newly added file on the filesystem, works only for all defined files in the served folder at the time of the server startup.

:::

### PAPI

Papi - API routes for the `tramvai` application. More information is available in [Papi](03-features/016-papi.md)

### Emulation of network/backends problems in the application

(functionality is only available in dev mode)

The server has the ability to increase the response time of all requests.

To do this you must:

- start the application
- send a POST request to `/private/papi/debug-http-request` with a delay for the request:

```shell script
curl --location --request POST 'http://localhost:3000/tincoin/private/papi/debug-http-request' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'delay=2000'
```

- check if the application works. Note: after each restart of the server the settings are reset, so after each rebuild it is necessary to access papi again.
- you can disable the timeout by accessing the same papi using the DELETE method

```shell script
curl --location --request DELETE 'http://localhost:3000/tincoin/private/papi/debug-http-request'
```

### Logging requests sent to the server

In dev mode, all requests sent through the standard `http` and `https` libraries for nodejs are logged under a special `server:node-debug:request` key. This allows you to see all requests that have been sent to the server, even if no logging has been defined for the requests explicitly.

To enable such logging, simply add the `server:node-debug:request` key to the `LOG_ENABLE` environment variable

### Health checks

- _`/healthz`_ - always replies `OK` after starting the application
- _`/readyz`_ - always replies `OK` after starting the application

Metrics

The metrics module is automatically connected into the server module. For more information on metrics, you can read [in the metrics documentation](references/modules/metrics.md)

### Warming application caches

The cache-warmup module is automatically plugged into the server module. Detailed information on cache warmup can be found [in cache-warmup documentation](references/modules/cache-warmup.md)

### Custom headers

#### Building and Deployment Information

There are special headers in the module, which help to determine the exact information about the version of the built application, commit, branch, etc:

- _x-app-id_ - The name of the application specified in `createApp`. Specified in the application code.
- _x-host_ - Hostname of the server where the current application is running. Computed in runtime.
- _x-app-version_ - version of the running application. Transmitted through the environment variable `APP_VERSION`.
- _x-deploy-branch_ - branch from which the current application image was built. Passed through environment variable `DEPLOY_BRANCH`.
- _x-deploy-commit_ - sha commit from which current application image was built. Passed through environment variable `DEPLOY_COMMIT`.
- _x-deploy-version_ - deploy revision number in k8s. Passed through environment variable `DEPLOY_VERSION`.
- _x-deploy-repository_ - application repository link. Passed through environment variable `DEPLOY_REPOSITORY`.

For all of the headers above which are passed via environment variables to be available, you need the external infrastructure to pass them when building and deprovisioning the application image (inside tinkoff this is done automatically).

#### Server-Timing

Header [Server-Timing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing) provides additional information about different timings that were spent on server to handle current request. Currently, it shows timings for [CommandLineRunner's](concepts/command-line-runner.md) lines execution.

To see values that related to request look for the header `Server-Timing` or check the `Timing` tab in browser DevTools for the page's main html.

### Debugging

Module uses loggers with identifiers: `server`, `server:static`, `server:webapp`, `server:node-debug:request`

### Early Hints

Module can send the [103 Early Hints](https://developer.chrome.com/blog/early-hints) response to provide better performance, though there are several limitations (look [here](https://chromium.googlesource.com/chromium/src/+/master/docs/early-hints.md#what_s-not-supported) and [here](https://developer.chrome.com/blog/early-hints/#current-limitations)).

If you want to enable Early Hints, provide `EARLY_HINTS_ENABLED` env variable:

```
EARLY_HINTS_ENABLED: 'true'
```

Or provide custom `EARLY_HINTS_ENABLED_TOKEN` token (`EARLY_HINTS_ENABLED` will be ignored):

```ts
import { EARLY_HINTS_ENABLED_TOKEN } from '@tramvai/tokens-server';

const provider = {
  provide: EARLY_HINTS_ENABLED_TOKEN,
  useValue: () => true,
};
```

:::info

You must check that the balancers and proxies in front of your application support Early Hints

:::

Currently, module provides hints for next resources:

- Resources with `preconnectLink` type;
- General resources, which have the `preloadLink` type;
- Page resources, that exist in the `ResourcesRegistry` with `'data-critical': "true"` attribute;
- Preconnects for CDN urls, that are computed from `preloadLink` or `data-critical` resources, described above;

Server will try to response with 103 as soon as possible and there can be more than one such responses.

```shell
curl -I -X HEAD http://localhost:3000

HTTP/1.1 103 Early Hints
Link: <https://www.cdn-tinkoff.ru>; rel=preconnect
Link: <https://www.cdn-tinkoff.ru/frontend-libraries/npm/react-kit-font/1.0.0/TinkoffSans.woff2>; rel=preload; as=font
Link: <https://www-stage.cdn-tinkoff.ru/frontend-libraries/feedback/1.14.0/feedback.css>; rel=preload; as=style
Link: <https://www-stage.cdn-tinkoff.ru>; rel=preconnect

HTTP/1.1 200 OK
...

```

## How to

### Setting `keepAliveTimeout` for the server

The default value for server's `keepAliveTimeout` is 5000. However, in case you want to set it manually just pass the environment variable `NODE_KEEPALIVE_TIMEOUT=[your_value]`. For further reading go to [NodeJs server.keepAliveTimeout page](https://nodejs.org/api/http.html#serverkeepalivetimeout).

### Specify server port

By default server starts at `3000` port. You have next options to override this value depending on your environment:

- **in dev environment** port in fully controlled by `@tramvai/cli` and should be specified by [`-p` option](references/cli/start.md#-p---port)
- **in prod environment** it can be specified explicitly as an environment variable `PORT` e.g. `PORT=8080`

### Specify port for utility paths

It includes: health checks, liveness checks, metrics.

By default port for utility paths equals [base server port](#specify-server-port) and they will use the same http server.

If you want to change this and run utility routes on different server with different port, use token `UTILITY_SERVER_PORT_TOKEN`:

```ts
import { UTILITY_SERVER_PORT_TOKEN } from '@tramvai/tokens-server';

const providers = [
  {
    provide: UTILITY_SERVER_PORT_TOKEN,
    useValue: 6532,
  },
];
```

Or use env variable `UTILITY_SERVER_PORT` with defined value.

```sh
env UTILITY_SERVER_PORT=6532 tramvai start app
```

### Specify path for liveness and readiness probes

By default, liveness and readiness probes are available by `healtz` and `readyz` paths.

If you want to change this paths, use `LIVENESS_PATH_TOKEN` and `READINESS_PATH_TOKEN` tokens.

```ts
import { LIVENESS_PATH_TOKEN, READINESS_PATH_TOKEN } from '@tramvai/tokens-server';

const providers = [
  {
    provide: LIVENESS_PATH_TOKEN,
    useValue: '/custom-liveness',
  },
  {
    provide: READINESS_PATH_TOKEN,
    useValue: '/custom-readiness',
  },
];
```

## Exportable tokens

[Link](references/tokens/server.md)
