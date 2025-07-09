---
id: runtimechunk
title: Webpack Runtime Chunk
---

## Webpack Runtime

You can control the webpack runtime chunk build with several options:

`false` (default) – the webpack runtime is included inside the chunk

`true / 'multiple'` – the webpack runtime is built separately for each chunk

`'single'` – the webpack runtime is built into a single chunk and shared across all chunks

Extracting the runtime into a separate chunk (using 'single' is recommended) helps improve the stability of asset hash generation.

However, there is a risk of performance degradation, as initializing the runtime in a separate chunk can delay the initialization of the entire codebase (this issue is especially relevant when the runtime is large, for example, when using integrity checks).

## Inline Runtime

You can also configure the method of loading the runtime chunk (works only for the inline strategy).

By default, the chunk is loaded as a separate chunk; however, you can inline the runtime directly into the HTML. This speeds up the runtime initialization time but increases the HTML size.

To enable this mode:

```typescript
provide({
  provide: INLINE_WEBPACK_RUNTIME,
  useValue: true,
});
```
