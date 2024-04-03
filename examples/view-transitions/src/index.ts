import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { SpaRouterModule, ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN } from '@tramvai/module-router';
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
  ],
  providers: [
    provide({
      provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      useValue: 'before',
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
