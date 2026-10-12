# react-query streaming playground

Playground for streaming `@tramvai/react-query` data from the server to the client with deferred actions, for host application and child app.

Every scenario shows where the data came from (`data from server` / `data from client`) and when it was shown. The footer lists all client-side calls of the fake API (host and child app), so a duplicated request is visible immediately: **a query started on the server must have no entry in the client calls log**.

The fake API (`shared/api.ts`) works in-process, delay and errors are configured per query.

## Run

```sh
# terminal 1
cd examples/react-query-streaming
yarn start:child

# terminal 2
cd examples/react-query-streaming
yarn start:host
```

Open http://localhost:3000/

Query parameters for any page:

- `?renderMode=sync|blocking` - compare with non-streaming rendering (`streaming` by default)
- `?streamingTimeout=ms` - response stream timeout (`5000` by default)

## API

```tsx
const query = createQuery({
  key: ['tickets'],
  fn: () => api.getTickets(),
  // prefetch is not awaited, result is streamed to the client
  deferred: true,
});

// `useQuery` - loader in shell, data from the stream
// `useSuspenseQuery` - ready HTML of the Suspense boundary from the stream
Page.actions = [query.prefetchAction()];
```

`query.prefetchAction(options, { deferred })` overrides the query option. Without streaming rendering (`?renderMode=sync`) deferred queries are awaited as regular ones.

## Scenarios

| Page                     | Scenario                                                 | Expected after the feature                                                       |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/baseline/`             | Blocking `prefetchAction`, for comparison                | Unchanged: data from server, no client calls                                     |
| `/deferred-use-query/`   | Deferred prefetch + `useQuery`                           | Loader in shell, data from server via stream, no client calls                    |
| `/deferred-suspense/`    | Deferred prefetch + `useSuspenseQuery`                   | Fallback in shell, ready HTML via stream, no client calls                         |
| `/parallel/`             | Several deferred queries with different delays           | Blocks revealed independently, no client calls                                   |
| `/errors/`               | Server errors (500, 404)                                 | No server retries without explicit `retry`, client fetches immediately with component options, no error state in between |
| `/timeout/`              | Query slower than stream timeout                         | With `?streamingTimeout=1500` slow queries are requested by the client           |
| `/spa/1/`                | Dynamic route params + SPA navigation                    | First load from server, SPA transitions: one client fetch per query            |
| `/child-app/`            | Child app scenarios + same query key in host and child   | Same as host, no collisions between QueryClients                                 |
| `/nested/`               | `fetchAction` inside a deferred query (early and late)   | Both children from server. Late child is requested by the client only when client code is loaded before the server starts the query (fast local network) |
| `/infinite/`             | Deferred `useInfiniteQuery` and `useSuspenseInfiniteQuery` without prefetch | First page from server, next pages are fetched on the client into the same list |
| `/no-prefetch/`          | `useQuery` / `useSuspenseQuery` without `prefetchAction` | `useQuery`: never fetched at server-side, client fetch. `useSuspenseQuery`: fetched during server render and streamed |

## Status

Transport is implemented in `@tramvai/module-react-query`, API in `@tramvai/react-query`: queries in flight at dehydration are streamed, `QueryClient` is cleared only after the response stream is finished.

Known gaps, see scenarios:

- `/nested/` - queries started after dehydration are streamed too, but if client code is already running and has started the same query, it is fetched by the client (race, mostly with fast local network)
