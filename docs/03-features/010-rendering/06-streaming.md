---
id: streaming
title: Streaming Rendering
---

React [Streaming Rendering](https://www.patterns.dev/posts/streaming-ssr) is **partially supported** by `tramvai` framework.

Streaming can significantly improve TTFB metric, but have some disadvantages:
- Require completely different framework architecture
- Performance overhead for Streams (10-20% slower rendering time)
- After first byte is sended, impossible to make server redirect or change response headers

For better new [React 18 Suspense SSR features](https://beta.reactjs.org/reference/react-dom/server/renderToString#when-a-component-suspends-the-html-always-contains-a-fallback) support, you can switch from [renderToString](https://beta.reactjs.org/reference/react-dom/server/renderToString) to [renderToPipeableStream](https://beta.reactjs.org/reference/react-dom/server/renderToPipeableStream) API, with token `REACT_SERVER_RENDER_MODE`.

With `renderToPipeableStream` `tramvai` still waiting `commandLineRunner` and page Actions before send HTML to client, the main difference is `Suspense` support: first chunk of HTML will contain application shell (usual rendering result with fallbacks for suspended components), and next chunks will have code to resolve suspended components.

[Deferred Actions](03-features/09-data-fetching/06-streaming-data.md) is based on this feature.

## Usage

:::caution

Experimental feature

:::

### Enable `renderToPipeableStream`

```ts
import { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';

const provider = provide({
  provide: REACT_SERVER_RENDER_MODE,
  useValue: 'streaming',
});
```

### Response stream timeout

Default timeout for `renderToPipeableStream` response is `5000` milliseconds. Deferred Actions which are not resolved in this time will be rejected with `AbortedDeferredError` error.

If you want to provide custom timeout value, you can provide `REACT_STREAMING_RENDER_TIMEOUT` token:

```ts
import { REACT_STREAMING_RENDER_TIMEOUT } from '@tramvai/tokens-render';

const provider = provide({
  provide: REACT_STREAMING_RENDER_TIMEOUT,
  useValue: 10000,
});
```

## Troubleshooting

### Proxy buffering

To enable HTML streaming, you must disable response buffering on the reverse proxy. `Nginx` for example, with default configuration, will buffer response body (or part of it) in memory, and first byte time will be increased - it is opposite what HTML streaming is supposed to do.

You can disable buffering at application level by setting `X-Accel-Buffering` header:

```ts
import { commandLineListTokens, provide } from '@tramvai/core';
import { RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';

const provider = provide({
  provide: commandLineListTokens.generatePage,
  useFactory: () => {
    return function addXAccelBufferingHeader() {
      responseManager.setHeader('X-Accel-Buffering', 'no');
    }
  },
  deps: {
    responseManager: RESPONSE_MANAGER_TOKEN,
  },
});
```

For `Nginx` configuration, disable [`proxy_buffering`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering):

```
proxy_buffering off;
```

### Proxy response timeout

If you use [Deferred Actions](03-features/09-data-fetching/06-streaming-data.md), probably you have a slow API calls. With increased [streaming timeout](#response-stream-timeout), complete response time can exceed the reverse proxy timeout. This will lead to `ERR_INCOMPLETE_CHUNKED_ENCODING` errors, broken HTML and possible hydration errors.

To prevent this, for `Nginx` you can increase [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout):

```
proxy_read_timeout 30s;
```

`REACT_STREAMING_RENDER_TIMEOUT` always needs to be lower than proxy timeout.
