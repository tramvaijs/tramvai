import { Scope, commandLineListTokens, optional, provide } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { Workbox } from 'workbox-window';
import { PWA_SW_SCOPE_TOKEN, PWA_SW_URL_TOKEN, PWA_WORKBOX_TOKEN } from '../../../tokens';

export const workboxRegisterProvider = provide({
  provide: commandLineListTokens.init,
  useFactory: ({ workbox, logger }) => {
    const log = logger('pwa:workbox');

    return function registerWorkbox() {
      // load workbox-window early but in non-blocking way
      (async () => {
        try {
          const wb = await workbox();

          if (!wb) {
            log.info('Service Worker registration stopped');
            return;
          }

          // @todo unregister when Workbox is disabled in config !!!
          // https://github.com/nuxt-community/pwa-module/blob/main/templates/workbox/workbox.unregister.js

          await wb.register();

          // @todo support force update strategies?
          if (process.env.NODE_ENV === 'development') {
            await wb.update();
          }
        } catch (error: any) {
          log.error({
            event: 'register-failed',
            message: 'Service Worker registration failed',
            error,
          });
        }
      })();
    };
  },
  deps: {
    workbox: PWA_WORKBOX_TOKEN,
    logger: LOGGER_TOKEN,
  },
});

export const pwaWorkboxTokenProvider = provide({
  provide: PWA_WORKBOX_TOKEN,
  scope: Scope.SINGLETON,
  useFactory: ({ swUrl, swScope, logger }) => {
    const log = logger('pwa:workbox');
    let workbox: null | Workbox = null;

    return async () => {
      if (!('serviceWorker' in navigator)) {
        log.info('Service Worker is not supported');
        return workbox;
      }

      if (workbox) {
        return workbox;
      }

      const { Workbox } = await import(
        /* webpackChunkName: "tramvai-workbox-window" */ 'workbox-window/Workbox'
      );

      workbox = new Workbox(swUrl, {
        scope: swScope,
      });

      workbox.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          // @todo on SW update callback
        } else {
          // @todo on SW first install callback
        }
      });

      return workbox;
    };
  },
  deps: {
    swUrl: PWA_SW_URL_TOKEN,
    swScope: PWA_SW_SCOPE_TOKEN,
    logger: LOGGER_TOKEN,
  },
});
