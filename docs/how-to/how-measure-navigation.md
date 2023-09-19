---
id: how-measure-navigation
title: How to measure SPA navigation?
---

In order to measure the spa-transition performance between routes, you have to connect to the router hooks. You can read more about the flow of SPA-transition in [this part](03-features/07-routing/02-navigation-flow.md#client-spa-navigation) of the documentation.

So, if we want to measure how long it took us to go from one page to another, we can use the following recipe:

```ts
import { declareModule, provide } from '@tramvai/core';
import { beforeResolveHooksToken, afterNavigateHooksToken } from '@tramvai/module-router';

/*
 * You can use your own marks and measures; this is only an example
 * */
export const SpaTransitionPerformanceMetrics = declareModule({
  name: 'SpaTransition',
  providers: [
    provide({
      provide: beforeResolveHooksToken,
      useValue: async () => {
        // clear before init
        performance.clearMeasures('spa-transition');
        performance.clearMarks('spa-transition-start');
        performance.clearMarks('spa-transition-end');

        // mark start of spa-transition
        performance.mark('spa-transition-start');
      },
    }),
    provide({
      provide: afterNavigateHooksToken,
      useValue: async ({ from, to }) => {
        performance.mark('spa-transition-end');
        performance.measure('spa-transition', 'spa-transition-start', 'spa-transition-end');

        console.log(
          `duration: ${performance.getEntriesByName('spa-transition-new')[0]?.duration}`,
          `from: ${from?.actualPath}`,
          `to: ${to?.actualPath}`
        );
      },
    }),
  ],
});
```
