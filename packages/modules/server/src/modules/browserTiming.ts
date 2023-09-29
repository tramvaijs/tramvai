import { commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { COMMAND_LINE_EXECUTION_END_TOKEN } from '@tramvai/tokens-core-private';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import isNil from '@tinkoff/utils/is/nil';

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
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
    provide({
      provide: COMMAND_LINE_EXECUTION_END_TOKEN,
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

          // special wark between `spa_transition` end and `after_spa_transition` start - in most ways it will be React rerender time
          if (line === 'spa_transition' || line === 'after_spa_transition') {
            const spaRenderStartMark = `spa-render-start:${keyPostfix}`;
            const spaRenderEndMark = `spa-render-end:${keyPostfix}`;

            if (line === 'spa_transition') {
              performance.mark(spaRenderStartMark, { startTime: end });
            } else if (line === 'after_spa_transition') {
              performance.mark(spaRenderEndMark, { startTime: start });

              const spaRenderMeasureName = `tramvai:spa-render:${keyPostfix}`;
              performance.measure(spaRenderMeasureName, spaRenderStartMark, spaRenderEndMark);

              [spaRenderStartMark, spaRenderEndMark].forEach((name) =>
                performance.clearMarks(name)
              );
              performance.clearMeasures(spaRenderMeasureName);
            }
          }
        });
      },
    }),
  ],
});
