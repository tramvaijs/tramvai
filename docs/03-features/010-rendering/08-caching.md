---
title: Caching
---

## Back/Forward Cache

Browser optimization for instant back and forward navigations for previously loaded pages. More details on it see on [web.dev](https://web.dev/bfcache/)

To enable/disable bfcache for tramvai app (under hood it disables/enables `no-store` value for `cache-control` header) use `BACK_FORWARD_CACHE_ENABLED` token from render module.

```ts
import { BACK_FORWARD_CACHE_ENABLED } from '@tramvai/tokens-render';

const providers = [
  {
    provide: BACK_FORWARD_CACHE_ENABLED,
    useValue: false,
  },
];
```

:::warning There is no guaranteed way to disable bfcache

Historically all browsers treated `Cache-Control: no-store` (CCNS) as an opt-out from bfcache, but this was never part of any specification, and modern browsers may not treat this header as a hard signal to disable bfcache.

Starting with the rollout completed in March–April 2025, **Chrome** allows CCNS pages into bfcache when it is considered safe. The page is instead evicted on cookie / authentication changes, kept in bfcache for a shorter window (~3 minutes), and still blocked only for pages using `WebSocket`, `WebTransport` or `WebRTC`, or when a `fetch`/`XHR` response itself returns `no-store`. See [Enabling bfcache for Cache-Control: no-store](https://developer.chrome.com/docs/web-platform/bfcache-ccns).

:::

### Troubleshooting

#### bfcache is not applied when enabled

Some of the used features on the page may block the page from putting it to the bfcache. tramvai framework tries to

To explore what is blocking the page refer to [docs](https://web.dev/bfcache/?utm_source=devtools#optimize-your-pages-for-bfcache) and use DevTools functionality to test out bfcache appliance.
