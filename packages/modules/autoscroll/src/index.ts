import { commandLineListTokens, Module, provide } from '@tramvai/core';
import { LAYOUT_OPTIONS } from '@tramvai/tokens-render';
import { ROUTER_TOKEN } from '@tramvai/module-router';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { Autoscroll } from './components/Autoscroll';

export * from './tokens';

export { Autoscroll };

@Module({
  providers: [
    provide({
      provide: LAYOUT_OPTIONS,
      useValue: {
        components: {
          autoscroll: Autoscroll,
        },
      },
      multi: true,
    }),
    ...(typeof window !== 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.customerStart,
            useFactory: ({ logger, router }) => {
              const log = logger('autoscroll');

              // disable browser scroll restoration, to avoid conflicts with autoscroll
              const disableBrowserScrollRestoration = () => {
                log.debug(
                  'Disabling browser scroll restoration, autoscroll will be applied for this history entry'
                );
                window.history.scrollRestoration = 'manual';
              };
              // enable browser scroll restoration, if autoscroll was disabled
              const enableBrowserScrollRestoration = () => {
                log.debug(
                  'Enable browser scroll restoration, autoscroll was disabled for this history entry'
                );
                window.history.scrollRestoration = 'auto';
              };

              return () => {
                // for initial page load
                if (!window.history.state?.navigateState?.disableAutoscroll) {
                  disableBrowserScrollRestoration();
                }
                // for sequent navigations
                router.registerSyncHook('change', async (navigation) => {
                  if (!navigation.navigateState?.disableAutoscroll) {
                    disableBrowserScrollRestoration();
                  } else {
                    enableBrowserScrollRestoration();
                  }
                });
              };
            },
            deps: {
              logger: LOGGER_TOKEN,
              router: ROUTER_TOKEN,
            },
          }),
        ]
      : []),
  ],
})
export class AutoscrollModule {}
