---
id: how-cancel-navigation
title: How to cancel SPA navigation?
---

You can use `cancel()` method of a Router to cancel SPA navigation. Method works inside any hook or guard and only when navigation is in progress

### Case 1. Cancel navigation after some time

Imagine we have to cancel SPA navigation if it takes too long:

```ts
import { commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';

const SHOW_NAVIGATION_ERROR_AFTER_MS = 30 * 1000;

export const SpaNavigationInterceptorModule = declareModule({
  name: 'SpaNavigationInterceptorModule',
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ router }) => {
        return () => {
          router.registerHook('beforeResolve', async (navigation) => {
            errorTimeoutId = setTimeout(function () {
              console.log('showing error...');

              cancelled = router.cancel()!;
            }, SHOW_NAVIGATION_ERROR_AFTER_MS);
          });

          router.registerHook('afterNavigate', async (navigation) => {
            clearTimeout(errorTimeoutId);
          });
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
  ],
});
```

### Case 2. Resume navigation after it has been canceled

Let's make the case harder. We have to show error notification if SPA navigation takes too long time. Once navigation is completed we have to tell the user "We've loaded the page, do you want to continue?" and resume navigation if the user clicks "Yes"

```ts
import { commandLineListTokens, declareModule, provide } from '@tramvai/core';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';

const SHOW_NAVIGATION_ERROR_AFTER_MS = 30 * 1000;

export const SpaNavigationInterceptorModule = declareModule({
  name: 'SpaNavigationInterceptorModule',
  providers: [
    provide({
      provide: commandLineListTokens.customerStart,
      multi: true,
      useFactory: ({ router }) => {
        return () => {
          let cancelled: Navigation | undefined;

          router.registerHook('beforeResolve', async (navigation) => {
            errorTimeoutId = setTimeout(function () {
              errorNotificationId = notifier.add({
                title: 'Error loading page',
                type: 'error',
                timer: false,
              });

              cancelled = router.cancel()!;
            }, SHOW_NAVIGATION_ERROR_AFTER_MS);
          });

          // This hook will be called just before the navigation commiting. We can be sure the navigation is completed
          router.registerHook('beforeNavigate', async (navigation) => {
            // Show info notification if:
            // - there is error notification
            // - current navigation is the cancelled one (for cases when user has clicked several links)
            if (
              errorNotificationId &&
              cancelled?.url?.href === navigation.url?.href
            ) {
              clear(notifier);

              completedNotificationId = notifier.add({
                text: "We've loaded the page, do you want to continue?",
                actionText: 'Continue!',
                onActionConfirm: () => {
                  // Since now cancelled navigation inside router's cache, so we can safely call router.navigate
                  router.navigate(cancelled!.url!.href);
                },
                timer: false,
              });
            } else {
              return Promise.resolve();
            }
          });

          router.registerHook('afterNavigate', async (navigation) => {
            // Clear all notifications and timeouts if real navigation has happened
            if (!navigation.skipped) {
              clear(notifier);
            }
          });
        };
      },
      deps: {
        router: ROUTER_TOKEN,
        notifier: NOTIFICATION_MANAGER,
      },
    }),
  ],
});
```
