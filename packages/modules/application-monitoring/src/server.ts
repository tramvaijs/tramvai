import {
  declareModule,
  provide,
  commandLineListTokens,
  APP_INFO_TOKEN,
  TRAMVAI_HOOKS_TOKEN,
} from '@tramvai/core';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import {
  INLINE_REPORTER_EXTENSIONS_TOKEN,
  INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
  INLINE_REPORTER_PARAMETERS_TOKEN,
  INLINE_REPORTER_TRANSPORTS_TOKEN,
} from './tokens';
import { LOGGER_NAME } from './constants';

import { errorMonitoringScript, htmlOpenedMonitoringScript } from './inlineReporters/events';
import { inlineReporter } from './inlineReporter.inline';

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
          tramvaiHooks['react:render-started'].tap('application-health', () => {
            log.info({ event: 'react:render-started' });
            tramvaiHooks['app:render-started'].call({});
          });
          tramvaiHooks['react:render'].tap('application-health', (_, payload) => {
            log.info({ event: 'react:render' });
            if (payload.event === 'ssr:on-all-ready' || payload.event === 'ssr:finished') {
              tramvaiHooks['app:rendered'].call({ duration: payload.duration });
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
      // default implementation of the window.__TRAMVAI_INLINE_REPORTER
      provide: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
      useValue: inlineReporter,
    }),
    provide({
      provide: INLINE_REPORTER_PARAMETERS_TOKEN,
      multi: true,
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
      useFactory: ({ inlineReporterFactory, inlineReporterParametersList }) => {
        const inlineReporterParameters = Object.assign({}, ...inlineReporterParametersList);
        return {
          // HEAD_META renders fully before HEAD_PERFORMANCE (see htmlPageSchema.ts) - the
          // dispatcher must exist and have every extension/transport registered before any
          // HEAD_PERFORMANCE script (htmlOpened, error monitoring, retryAssets, ...) can call
          // send(); this ordering guarantee is what lets the dispatcher skip buffering entirely
          slot: ResourceSlot.HEAD_META,
          type: ResourceType.inlineScript,
          payload: `window.__TRAMVAI_INLINE_REPORTER = (${inlineReporterFactory})(${JSON.stringify(inlineReporterParameters)})`,
        };
      },
      deps: {
        inlineReporterParametersList: INLINE_REPORTER_PARAMETERS_TOKEN,
        inlineReporterFactory: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ extensions }) => {
        return (extensions || []).map((extensionFactory) => ({
          // see the bootstrap provider above for why this must stay in HEAD_META
          slot: ResourceSlot.HEAD_META,
          type: ResourceType.inlineScript,
          // the factory itself is passed, not invoked here - the dispatcher applies its own
          // `parameters` when registerExtension is called (see inlineReporter.inline.ts), so the
          // merged parameters JSON is serialized once (bootstrap script above), not once per
          // extension. `?.` - a full-replacement INLINE_REPORTER_FACTORY_SCRIPT_TOKEN factory is
          // not required to implement registerExtension; skip instead of throwing if it doesn't
          payload: `window.__TRAMVAI_INLINE_REPORTER.registerExtension?.(${extensionFactory})`,
        }));
      },
      deps: {
        extensions: { token: INLINE_REPORTER_EXTENSIONS_TOKEN, optional: true, multi: true },
      },
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ transports }) => {
        return (transports || []).map((transportFactory) => ({
          // see the bootstrap provider above for why this must stay in HEAD_META
          slot: ResourceSlot.HEAD_META,
          type: ResourceType.inlineScript,
          // same reasoning as registerExtension above - factory passed as-is, the dispatcher
          // applies its own parameters
          payload: `window.__TRAMVAI_INLINE_REPORTER.registerTransport?.(${transportFactory})`,
        }));
      },
      deps: {
        transports: { token: INLINE_REPORTER_TRANSPORTS_TOKEN, optional: true, multi: true },
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
  ],
});
