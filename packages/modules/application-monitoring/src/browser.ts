import { declareModule } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/module-common';
import { provide, commandLineListTokens, TRAMVAI_HOOKS_TOKEN } from '@tramvai/core';
import { LOGGER_NAME } from './constants';

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
  ],
});
