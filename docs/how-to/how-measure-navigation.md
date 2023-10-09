---
id: how-measure-navigation
title: How to measure SPA navigation?
---

In order to measure the spa-transition performance between routes, you have to connect to the router hooks. You can read more about the flow of SPA-transition in [this part](03-features/07-routing/02-navigation-flow.md#client-spa-navigation) of the documentation.

So, if we want to measure how long it took us to go from one page to another, we can use the following recipes:

#### Recipe #1

Based on navigation hooks execution, it can be helpful if you have long after-navigate actions or tasks, which can seriously affect measurements.

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
          router.registerHook('beforeResolve', async ({ key }) => {
            const startKey = `router:spa-transition:start:${key}`;

            performance.mark(startKey);
          });

          // If you want to include page actions in spa transition,
          // you should use second recipe
          router.registerHook('afterNavigate', async ({ key }) => {
            const startKey = `router:spa-transition:start:${key}`;
            const endKey = `router:spa-transition:end:${key}`;
            const measureKey = `router:spa-transition:${key}`;

            performance.mark(endKey);
            performance.measure(measureKey, startKey, endKey);

            performance.clearMeasures(measureKey);
            [startKey, endKey].forEach((name) => performance.clearMarks(name));
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

#### Recipe #2

Based on `commandLineRunner` execution and runs upon `COMMAND_LINE_EXECUTION_END_TOKEN`. It's more accurate measurement for spa navigation, but its result will be shown only after spa actions or tasks are executed.

:::note

You shouldn't rely on current route in this type of recipe because it can be irrelevant to the execution context. Current route could have been changed a long time ago.

:::

```ts
export const SpaTransitionPerformanceMetrics = declareModule({
  name: 'SpaTransitionPerformanceMetrics',
  providers: [
    provide({
      provide: COMMAND_LINE_EXECUTION_END_TOKEN,
      multi: true,
      useValue: (di, type, status, timingInfo, key) => {
        Object.keys(timingInfo).forEach((line) => {
          const { start, end } = timingInfo[line];
          const keyPostfix = isNil(key) ? '' : `:${key}`;

          if (line === 'spa_transition' || line === 'after_spa_transition') {
            const spaTransitionStartMark = `spa-transition-start:${keyPostfix}`;
            const spaTransitionEndMark = `spa-transition-end:${keyPostfix}`;
            const spaTransitionWithActionsEndMark = `spa-transition-with-actions-end:${keyPostfix}`;

            if (line === 'spa_transition') {
              performance.mark(spaTransitionStartMark, { startTime: start });
            } else if (line === 'after_spa_transition') {
              performance.mark(spaTransitionEndMark, { startTime: start });
              performance.mark(spaTransitionWithActionsEndMark, { startTime: end });

              const spaTransitionMeasureName = `spa-transition:${keyPostfix}`;
              const spaTransitionWithActionsMeasureName = `spa-transition-with-actions:${keyPostfix}`;

              performance.measure(
                spaTransitionMeasureName,
                spaTransitionStartMark,
                spaTransitionEndMark
              );
              performance.measure(
                spaTransitionWithActionsMeasureName,
                spaTransitionStartMark,
                spaTransitionWithActionsEndMark
              );

              performance.clearMarks(spaTransitionStartMark);
              performance.clearMarks(spaTransitionEndMark);
              performance.clearMarks(spaTransitionWithActionsEndMark);

              performance.clearMeasures(spaTransitionMeasureName);
              performance.clearMeasures(spaTransitionWithActionsMeasureName);
            }
          }
        });
      },
    }),
  ],
});
```
