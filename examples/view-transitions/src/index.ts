import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import {
  SpaRouterModule,
  ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
  ROUTER_VIEW_TRANSITIONS_ENABLED,
  ROUTER_PLUGIN,
  ROUTER_TOKEN,
} from '@tramvai/module-router';
import {
  DEFAULT_FOOTER_COMPONENT,
  DEFAULT_HEADER_COMPONENT,
  LAYOUT_OPTIONS,
  RENDER_SLOTS,
  RenderModule,
  ResourceSlot,
  ResourceType,
} from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import {
  ScrollRestorationModule,
  AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
  AUTOSCROLL_DISABLED_TOKEN,
} from '@tramvai/module-autoscroll';

import Header from './components/Header';
import Footer from './components/Footer';
import Player from './components/Player';
import { layoutWrapper } from './contexts/PlayerContext';

import './index.global.css';

import favicon from './assets/favicon.png';

createApp({
  name: 'view-transitions',
  modules: [
    CommonModule,
    SpaRouterModule.forRoot([
      {
        path: '/',
        name: 'root',
        redirect: '/home',
      },
    ]),
    RenderModule,
    ServerModule,
    ScrollRestorationModule,
  ],
  providers: [
    provide({
      provide: ROUTER_VIEW_TRANSITIONS_ENABLED,
      useValue: true,
    }),
    provide({
      provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      useValue: 'before',
    }),
    provide({
      provide: AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
      useValue: 'instant',
    }),
    provide({
      provide: AUTOSCROLL_DISABLED_TOKEN,
      useFactory: ({ router }) => {
        return () => {
          const navigation = router.getCurrentNavigation() ?? router.getLastNavigation();

          if (navigation && navigation.replace) {
            return true;
          }
        };
      },
      deps: {
        router: ROUTER_TOKEN,
      },
    }),
    provide({
      provide: ROUTER_PLUGIN,
      useFactory: (deps) => {
        return {
          apply(router) {
            router.internalHooks['router:resolve-view-transition'].tap(
              'supreme',
              (_, params, viewTransition) => {
                const { navigation, previousViewTransition } = params;

                // mirror previous navigation type for browser back/forward navigations
                if (navigation.history) {
                  if (
                    previousViewTransition.viewTransition &&
                    previousViewTransition.viewTransitionTypes?.includes('forwards')
                  ) {
                    return {
                      viewTransition: true,
                      viewTransitionTypes: navigation.isBack ? ['backwards'] : ['forwards'],
                    };
                  }
                  if (
                    previousViewTransition.viewTransition &&
                    previousViewTransition.viewTransitionTypes?.includes('backwards')
                  ) {
                    return {
                      viewTransition: true,
                      viewTransitionTypes: navigation.isBack ? ['forwards'] : ['backwards'],
                    };
                  }
                }

                // default resolved view transition state
                return viewTransition;
              }
            );
          },
        };
      },
      deps: {},
    }),
    provide({
      provide: LAYOUT_OPTIONS,
      multi: true,
      useValue: {
        components: {
          player: Player,
        },
        wrappers: {
          layout: layoutWrapper,
        },
      },
    }),
    provide({
      provide: DEFAULT_HEADER_COMPONENT,
      useValue: Header,
    }),
    provide({
      provide: DEFAULT_FOOTER_COMPONENT,
      useValue: Footer,
    }),
    provide({
      provide: RENDER_SLOTS,
      useValue: {
        type: ResourceType.iconLink,
        slot: ResourceSlot.HEAD_ICONS,
        payload: favicon,
        attrs: {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
        },
      },
    }),
  ],
});
