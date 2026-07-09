import {
  declareModule,
  provide,
  commandLineListTokens,
  APP_INFO_TOKEN,
  TRAMVAI_HOOKS_TOKEN,
} from '@tramvai/core';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import { INLINE_REPORTER_FACTORY_SCRIPT_TOKEN, INLINE_REPORTER_PARAMETERS_TOKEN } from './tokens';
import { LOGGER_NAME } from './constants';

import {
  appCreationMonitoringScript,
  errorMonitoringScript,
  htmlOpenedMonitoringScript,
} from './inlineReporters/events';

export * from './types';
export * from './tokens';

export const ApplicationMonitoringModule = declareModule({
  name: 'ApplicationMonitoringModule',
  imports: [],
  providers: [
    provide({
      provide: commandLineListTokens.init,
      useFactory: ({ logger, tramvaiHooks }) => {
        const log = logger({
          name: LOGGER_NAME,
        });

        return function applicationHealthSubscribe() {
          tramvaiHooks['app:initialized'].tap('application-health', () => {
            log.info({ event: 'app:initialized' });
          });
          tramvaiHooks['app:initialize-failed'].tap('application-health', () => {
            log.info({ event: 'app:initialized-failed' });
          });
          tramvaiHooks['app:rendered'].tap('application-health', () => {
            log.info({ event: 'app:rendered' });
          });
          tramvaiHooks['react:render'].tap('application-health', (_, payload) => {
            log.info({ event: 'react:render' });
            if (payload.event === 'ssr:on-all-ready') {
              tramvaiHooks['app:rendered'].call({});
            }
          });
          tramvaiHooks['app:render-failed'].tap('application-health', (_, { error }) => {
            log.error({ event: 'app:render-failed', error });
          });
          tramvaiHooks['react:error'].tap(
            'application-health',
            (_, { event, error, errorInfo, otherErrors }) => {
              log.error({ event: 'react:error', error, errorInfo, otherErrors });
              switch (event) {
                case 'ssr:on-shell-error': {
                  tramvaiHooks['app:render-failed'].call({ error });
                  break;
                }
              }
            }
          );
        };
      },
      deps: {
        logger: LOGGER_TOKEN,
        tramvaiHooks: TRAMVAI_HOOKS_TOKEN,
      },
    }),
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
      provide: INLINE_REPORTER_PARAMETERS_TOKEN,
      useFactory: ({ appInfo, envManager }) => {
        return {
          appName: appInfo.appName,
          appRelease: envManager.get('APP_RELEASE'),
          appVersion: envManager.get('APP_VERSION'),
        };
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
        appInfo: APP_INFO_TOKEN,
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
