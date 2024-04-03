import { Scope, commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { COMMAND_LINE_EXECUTION_END_TOKEN } from '@tramvai/tokens-core-private';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import isNil from '@tinkoff/utils/is/nil';
import afterFrame from 'afterframe';

export const BrowserTimingModule = declareModule({
  name: 'BrowserTiming',
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ router }) => {
        return () => {
          router.registerHook('beforeResolve', async ({ key }) => {
            const startKey = `router:before-resolve:start:${key}`;

            performance.mark(startKey);
          });

          router.registerHook('beforeNavigate', async ({ key }) => {
            const startKey = `router:before-resolve:start:${key}`;
            const endKey = `router:before-resolve:end:${key}`;
            const measureKey = `router:before-resolve:${key}`;

            performance.mark(endKey);
            performance.measure(measureKey, startKey, endKey);

            performance.clearMeasures(measureKey);
            [startKey, endKey].forEach((name) => performance.clearMarks(name));
          });

          // Inaccurate measurements
          router.registerSyncHook('change', ({ key }) => {
            const startKey = `router:spa-render:start:${key}`;
            const endKey = `router:spa-render:end:${key}`;
            const measureKey = `router:spa-render:${key}`;

            performance.mark(startKey);

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
    provide({
      provide: COMMAND_LINE_EXECUTION_END_TOKEN,
      scope: Scope.SINGLETON,
      multi: true,
      useValue: (di, type, status, timingInfo, key) => {
        Object.keys(timingInfo).forEach((line) => {
          const { start, end } = timingInfo[line];
          const keyPostfix = isNil(key) ? '' : `:${key}`;

          const name = `command-line:${line}${keyPostfix}`;
          const startName = `${name}:start`;
          const endName = `${name}:end`;

          performance.mark(startName, { startTime: start });
          performance.mark(endName, { startTime: end });
          performance.measure(name, startName, endName);

          [startName, endName].forEach((name) => performance.clearMarks(name));
          performance.clearMeasures(name);
        });
      },
    }),
  ],
});
