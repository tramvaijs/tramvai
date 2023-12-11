import { commandLineListTokens, optional, provide } from '@tramvai/core';
import {
  REACT_SERVER_RENDER_MODE,
  RESOURCES_REGISTRY,
  ResourceSlot,
  ResourceType,
} from '@tramvai/tokens-render';
import { DEFERRED_ACTIONS_MAP_TOKEN } from '@tramvai/tokens-common';
import type { Deferred as IDeferred } from '@tramvai/tokens-common';
import { Deferred } from './deferred.inline';
import { generateDeferredReject, generateDeferredResolve } from './clientScriptsUtils';

export const providers = [
  provide({
    provide: DEFERRED_ACTIONS_MAP_TOKEN,
    useFactory: () => new Map<string, IDeferred>(),
  }),
  provide({
    provide: commandLineListTokens.generatePage,
    useFactory: ({ resourcesRegistry, deferredMap, renderMode }) => {
      // eslint-disable-next-line max-statements
      return async function render() {
        if (renderMode === 'streaming') {
          resourcesRegistry.register({
            slot: ResourceSlot.HEAD_CORE_SCRIPTS,
            type: ResourceType.inlineScript,
            payload: `window.__Deferred = ${Deferred}
window.__TRAMVAI_DEFERRED_ACTIONS = {};`,
          });

          deferredMap.forEach((deferred, key) => {
            const scriptLines = [
              `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'] = new __Deferred();`,
              `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'].promise.catch(function(){});`,
            ];

            if (deferred.isResolved()) {
              scriptLines.push(
                generateDeferredResolve({
                  key,
                  data: deferred.resolveData,
                })
              );
            } else if (deferred.isRejected()) {
              scriptLines.push(
                generateDeferredReject({
                  key,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  error: deferred.rejectReason!,
                })
              );
            }

            resourcesRegistry.register({
              slot: ResourceSlot.HEAD_CORE_SCRIPTS,
              type: ResourceType.inlineScript,
              payload: scriptLines.join('\n'),
            });
          });
        }
      };
    },
    deps: {
      resourcesRegistry: RESOURCES_REGISTRY,
      deferredMap: DEFERRED_ACTIONS_MAP_TOKEN,
      renderMode: optional(REACT_SERVER_RENDER_MODE),
    },
  }),
];
