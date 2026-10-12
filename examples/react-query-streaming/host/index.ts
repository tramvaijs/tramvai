import { createApp, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
import { PAGE_SERVICE_TOKEN, SpaRouterModule } from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';
import { ReactQueryModule, QUERY_STREAMING_ENABLED_TOKEN } from '@tramvai/module-react-query';
import { ChildAppModule, CHILD_APP_RESOLUTION_CONFIGS_TOKEN } from '@tramvai/module-child-app';
import {
  DEFAULT_FOOTER_COMPONENT,
  DEFAULT_HEADER_COMPONENT,
  REACT_SERVER_RENDER_MODE,
  REACT_STREAMING_RENDER_TIMEOUT,
  RESOURCE_INLINE_OPTIONS,
} from '@tramvai/tokens-render';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const RENDER_MODES = ['sync', 'streaming', 'blocking'];

createApp({
  name: 'rq-streaming-host',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    ReactQueryModule,
    ChildAppModule,
  ],
  providers: [
    provide({
      provide: QUERY_STREAMING_ENABLED_TOKEN,
      useValue: true,
    }),
    provide({
      provide: DEFAULT_HEADER_COMPONENT,
      useValue: Header,
    }),
    provide({
      provide: DEFAULT_FOOTER_COMPONENT,
      useValue: Footer,
    }),
    // `?renderMode=sync|blocking` to compare with non-streaming rendering, `streaming` by default
    provide({
      provide: REACT_SERVER_RENDER_MODE,
      useFactory: ({ pageService }) => {
        const mode = String(pageService.getCurrentUrl()?.query?.renderMode);

        return (
          RENDER_MODES.includes(mode) ? mode : 'streaming'
        ) as typeof REACT_SERVER_RENDER_MODE;
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
      },
    }),
    // `?streamingTimeout=ms` to check aborted streams
    provide({
      provide: REACT_STREAMING_RENDER_TIMEOUT,
      useFactory: ({ pageService }) => {
        const timeout = pageService.getCurrentUrl()?.query?.streamingTimeout;

        return timeout != null ? Number(timeout) : 5000;
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
      },
    }),
    // easier to read page source
    provide({
      provide: RESOURCE_INLINE_OPTIONS,
      useValue: {
        types: [],
        threshold: 0,
      },
    }),
    provide({
      provide: CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
      multi: true,
      useValue: [
        {
          name: 'rq-streaming-child',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
      ],
    }),
  ],
});
