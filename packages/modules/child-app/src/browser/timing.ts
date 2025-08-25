import { declareModule, provide, Scope } from '@tramvai/core';

import {
  CHILD_APP_PRELOAD_MANAGER_PLUGIN,
  CHILD_APP_LOADER_PLUGIN,
  CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
} from '@tramvai/tokens-child-app';

import type {
  ChildAppLoaderHooks,
  ChildAppConfigResolutionHooks,
  ChildAppPreloadHooks,
} from '@tramvai/tokens-child-app';

export const ChildAppMonitoringTimingModule = declareModule({
  name: 'ChildAppMonitoringTiming',
  providers: [
    provide({
      scope: Scope.SINGLETON,
      provide: CHILD_APP_LOADER_PLUGIN,
      useFactory: () => {
        return {
          apply(hooks: ChildAppLoaderHooks) {
            hooks.loadModule.wrap(async (_, payload, next) => {
              const childAppName = payload.config.name;
              const startKey = `child-app:load-module:${childAppName}:start`;
              const measureKey = `child-app:load-module:${childAppName}`;

              performance.mark(startKey);

              const childApp = await next(payload);

              const endKey = `child-app:load-module:${childAppName}:end`;
              performance.mark(endKey);
              performance.measure(measureKey, startKey, endKey);
              [startKey, endKey].forEach((name) => performance.clearMarks(name));
              return childApp;
            });
          },
        };
      },
    }),
    provide({
      provide: CHILD_APP_PRELOAD_MANAGER_PLUGIN,
      useFactory: () => {
        return {
          apply(hooks: ChildAppPreloadHooks) {
            hooks.prefetchChildApp.wrap(async (_, payload, next) => {
              const childAppName = payload.config.name;

              const startKey = `child-app:prefetch:${childAppName}:start`;
              const endKey = `child-app:prefetch:${childAppName}:end`;
              const measureKey = `child-app:prefetch:${childAppName}`;

              performance.mark(startKey);

              await next(payload);
              performance.mark(endKey);
              performance.measure(measureKey, startKey, endKey);
              [startKey, endKey].forEach((name) => {
                performance.clearMarks(name);
              });
            });

            hooks.preloadChildApp.wrap(async (_, payload, next) => {
              const childAppName = payload.config.name;

              const startKey = `child-app:preload:${childAppName}:start`;
              const endKey = `child-app:preload:${childAppName}:end`;
              const measureKey = `child-app:preload:${childAppName}`;

              performance.mark(startKey);

              await next(payload);
              performance.mark(endKey);
              performance.measure(measureKey, startKey, endKey);
              [startKey, endKey].forEach((name) => {
                performance.clearMarks(name);
              });
            });

            hooks.runChildAppCommandLine.wrap(async (_, payload, next) => {
              const childAppName = payload.config.name;
              const startKey = `child-app:command-line-run:${childAppName}:${payload.line}:${payload.status}:start`;
              const endKey = `child-app:command-line-run:${childAppName}:${payload.line}:${payload.status}:end`;
              const measureKey = `child-app:command-line-run:${childAppName}:${payload.line}:${payload.status}`;

              performance.mark(startKey);

              await next(payload);

              performance.mark(endKey);
              performance.measure(measureKey, startKey, endKey);

              [startKey, endKey].forEach((name) => {
                performance.clearMarks(name);
              });
            });
          },
        };
      },
    }),
    provide({
      provide: CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
      useFactory: () => {
        return {
          apply(hooks: ChildAppConfigResolutionHooks) {
            hooks.fetchConfig.wrap(async (_, payload, next) => {
              const startKey = `child-app:fetch-config:start`;
              const measureKey = `child-app:fetch-config`;

              performance.mark(startKey);

              const configs = await next(payload);

              const endKey = `child-app:fetch-config:end`;
              performance.mark(endKey);
              performance.measure(measureKey, startKey, endKey);
              [startKey, endKey].forEach((name) => performance.clearMarks(name));
              return configs;
            });
          },
        };
      },
    }),
  ],
});
