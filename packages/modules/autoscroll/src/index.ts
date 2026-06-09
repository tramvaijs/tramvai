import { commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { LAYOUT_OPTIONS } from '@tramvai/tokens-render';
import { ROUTER_TOKEN } from '@tramvai/module-router';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { HistoryState } from '@tinkoff/router';
import { Autoscroll } from './components/Autoscroll';
import { ScrollRestoration } from './components/ScrollRestoration';
import { AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN } from './tokens';

export * from './tokens';

export { Autoscroll, ScrollRestoration };

const APPLIED_NAVIGATIONS_KEY = '_t_autoscroll_applied_navigations';

/**
 * @deprecated use ScrollRestorationModule instead, which includes autoscroll and compatible with View Transitions
 */
export const AutoscrollModule = declareModule({
  name: 'AutoscrollModule',
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
});

export const ScrollRestorationModule = declareModule({
  name: 'ScrollRestorationModule',
  providers: [
    provide({
      provide: LAYOUT_OPTIONS,
      useValue: {
        components: {
          autoscroll: ScrollRestoration,
        },
      },
      multi: true,
    }),
    provide({
      provide: AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN,
      useFactory: () => new Map(),
    }),
    ...(typeof window !== 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.customerStart,
            useFactory: ({ logger, router, appliedNavigations }) => {
              const log = logger('autoscroll');

              return () => {
                try {
                  log.debug('Restoring applied navigations from sessionStorage');

                  const valueFromStorage = sessionStorage.getItem(APPLIED_NAVIGATIONS_KEY);

                  if (valueFromStorage !== null) {
                    const parsedValue = JSON.parse(valueFromStorage);

                    Object.entries(parsedValue).forEach(([key, value]) => {
                      appliedNavigations.set(
                        Number.parseInt(key, 10),
                        value as { href: string; scrollTop: number }
                      );
                    });
                  } else {
                    log.debug('No applied navigations found in sessionStorage');
                  }
                } catch (error) {}

                window.addEventListener('pagehide', () => {
                  // to correct scroll restoration for current page in case of reload,
                  // both enable automatic scroll restoration and save scroll position
                  window.history.scrollRestoration = 'auto';

                  const state: HistoryState = (router as any).history.getCurrentState();

                  appliedNavigations.set(state.index, {
                    href: router.getCurrentUrl()?.href || window.location.href,
                    scrollTop: window.scrollY,
                  });

                  try {
                    log.debug('Saving applied navigations to sessionStorage');

                    const valueToSave: Record<
                      number,
                      {
                        href: string;
                        scrollTop: number;
                      }
                    > = {};

                    for (const [key, value] of appliedNavigations) {
                      valueToSave[key] = value;
                    }

                    sessionStorage.setItem(APPLIED_NAVIGATIONS_KEY, JSON.stringify(valueToSave));
                  } catch (error) {}
                });

                // case for browser back/forward buttons and router.go/back/forward navigations,
                // here `history.getCurrentState()` and `router.getCurrentUrl()` will return leaving page values,
                // so we can save scroll position for correct page index
                window.addEventListener('popstate', (event) => {
                  const state: HistoryState = (router as any).history.getCurrentState();

                  appliedNavigations.set(state.index, {
                    href: router.getCurrentUrl()?.href || window.location.href,
                    scrollTop: window.scrollY,
                  });

                  log.debug(
                    `Save scroll position on history change, index: ${state.index}, scrollTop: ${window.scrollY}, url: ${router.getCurrentUrl()?.href || window.location.href}`
                  );
                });

                // case for router.navigate navigation
                router.registerHook('beforeNavigate', async (navigation) => {
                  if (!navigation.history) {
                    const state: HistoryState = (router as any).history.getCurrentState();

                    appliedNavigations.set(state.index, {
                      href: navigation.fromUrl?.href || window.location.href,
                      scrollTop: window.scrollY,
                    });

                    log.debug(
                      `Save scroll position on router.navigate, index: ${state.index}, scrollTop: ${window.scrollY}, url: ${navigation.fromUrl?.href || window.location.href}`
                    );

                    // browser invalidates forward history on pushState, prune stale entries
                    for (const key of appliedNavigations.keys()) {
                      if (key > state.index) {
                        appliedNavigations.delete(key);
                      }
                    }
                  }
                });

                // case for router.updateCurrentRoute navigation
                router.registerHook('beforeUpdateCurrent', async (navigation) => {
                  if (!navigation.history) {
                    const state: HistoryState = (router as any).history.getCurrentState();

                    appliedNavigations.set(state.index, {
                      href: navigation.fromUrl?.href || window.location.href,
                      scrollTop: window.scrollY,
                    });

                    log.debug(
                      `Save scroll position on router.updateCurrentRoute, index: ${state.index}, scrollTop: ${window.scrollY}, url: ${navigation.fromUrl?.href || window.location.href}`
                    );
                  }
                });
              };
            },
            deps: {
              logger: LOGGER_TOKEN,
              router: ROUTER_TOKEN,
              appliedNavigations: AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN,
            },
          }),
        ]
      : []),
  ],
});
