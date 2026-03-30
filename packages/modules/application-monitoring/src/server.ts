import { declareModule, provide } from '@tramvai/core';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { LOGGER_TOKEN } from '@tramvai/module-common';
import { INLINE_REPORTER_FACTORY_SCRIPT_TOKEN, INLINE_REPORTER_PARAMETERS_TOKEN } from './tokens';

import {
  appCreationMonitoringScript,
  errorMonitoringScript,
  htmlOpenedMonitoringScript,
} from './inlineReporters/events';

import { sharedProviders } from './sharedProviders';

export * from './types';
export * from './tokens';

export const ApplicationMonitoringModule = declareModule({
  name: 'ApplicationMonitoringModule',
  imports: [],
  providers: [
    ...sharedProviders,
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ inlineReporterFactory, inlineReporterParameters, logger }) => {
        const log = logger('application-monitoring');
        if (!inlineReporterFactory) {
          log.debug(
            '@tramvai/module-application-monitoring is on use but INLINE_REPORTER_FACTORY_SCRIPT_TOKEN token is not provided'
          );
          return [];
        }
        return {
          slot: ResourceSlot.HEAD_PERFORMANCE,
          type: ResourceType.inlineScript,
          payload: `window.__TRAMVAI_INLINE_REPORTER = (${inlineReporterFactory})(${JSON.stringify(inlineReporterParameters)})`,
        };
      },
      deps: {
        logger: LOGGER_TOKEN,
        inlineReporterParameters: INLINE_REPORTER_PARAMETERS_TOKEN,
        inlineReporterFactory: {
          token: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: () => {
        return {
          slot: ResourceSlot.HEAD_PERFORMANCE,
          type: ResourceType.inlineScript,
          payload: `(${htmlOpenedMonitoringScript})()`,
        };
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: () => {
        return {
          slot: ResourceSlot.HEAD_PERFORMANCE,
          type: ResourceType.inlineScript,
          payload: `(${errorMonitoringScript})()`,
        };
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: () => {
        return {
          slot: ResourceSlot.HEAD_PERFORMANCE,
          type: ResourceType.inlineScript,
          payload: `(${appCreationMonitoringScript})()`,
        };
      },
    }),
  ],
});
