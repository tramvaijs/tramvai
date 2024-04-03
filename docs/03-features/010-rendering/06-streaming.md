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
