import { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import { APP_INFO_TOKEN, provide, commandLineListTokens, TRAMVAI_HOOKS_TOKEN } from '@tramvai/core';
import { INLINE_REPORTER_PARAMETERS_TOKEN } from './tokens';

import { LOGGER_NAME } from './constants';

export const sharedProviders = [
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ logger, tramvaiHooks }) => {
      const log = logger({
        name: LOGGER_NAME,
        defaults: {
          remote: true,
        },
      });

      return function applicationHealthSubscribe() {
        let applicationRenderFinished = false;
        tramvaiHooks['app:initialized'].tap('application-health', () => {
          log.info({ event: 'app:initialized' });
        });
        tramvaiHooks['app:initialize-failed'].tap('application-health', () => {
          log.info({ event: 'app:initialized-failed' });
        });
        tramvaiHooks['app:rendered'].tap('application-health', () => {
          log.info({ event: 'app:rendered' });
        });
        tramvaiHooks['react:render'].tap('application-health', () => {
          log.info({ event: 'react:render' });
          if (!applicationRenderFinished) {
            applicationRenderFinished = true;
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
              case 'page-error-boundary':
              case 'hydrate:on-uncaught-error':
              case 'hydrate:failed': {
                if (!applicationRenderFinished) {
                  applicationRenderFinished = true;

                  tramvaiHooks['app:render-failed'].call({ error });
                }
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
];
