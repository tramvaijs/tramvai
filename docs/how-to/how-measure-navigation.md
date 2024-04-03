---
id: how-measure-navigation
title: How to measure SPA navigation?
---

In order to measure the spa-transition performance between routes, you have to connect to the router hooks. You can read more about the flow of SPA-transition in [this part](03-features/07-routing/02-navigation-flow.md#client-spa-navigation) of the documentation.

So, if we want to measure how long it took us to go from one page to another, we can use the following recipe:

```ts
import { commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';

/*
 * You can use your own marks and measures; this is only an example
 * */
export const SpaTransitionPerformanceMetrics = declareModule({
  name: 'SpaTransitionPerformanceMetrics',
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ router }) => {
        return () => {
          router.registerHook('beforeResolve', ({ key }) => {
            const startKey = `navigation_start:${key}`;
            performance.mark(startKey);
          });

          router.registerSyncHook('change', ({ key }) => {
            const startKey = `navigation_start:${key}`;
            const endKey = `navigation_end:${key}`;
            const measureKey = `spa_navigation:${key}`;

            afterFrame(() => {
              if (process.env.__TRAMVAI_CONCURRENT_FEATURES) {
                afterFrame(() => {
                  performance.mark(endKey);
                  performance.measure(measureKey, startKey, endKey);

                  performance.clearMeasures();
                  [startKey, endKey].forEach((name) => performance.clearMarks(name));
                });
              } else {
                performance.mark(endKey);
                performance.measure(measureKey, startKey, endKey);

                performance.clearMeasures();
                [startKey, endKey].forEach((name) => performance.clearMarks(name));
              }
            });
          });
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
  ],
});
```

Be careful, current recipe is inaccurate in terms of measure time for spa-navigation. But it is something you can use to compare relative metrics while boosting performance of your pages.
