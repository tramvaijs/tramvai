import { Module, commandLineListTokens, DI_TOKEN, provide, optional } from '@tramvai/core';
import { LOGGER_TOKEN, CONTEXT_TOKEN, STORE_TOKEN } from '@tramvai/tokens-common';
import {
  EXTEND_RENDER,
  CUSTOM_RENDER,
  RESOURCES_REGISTRY,
  RENDER_MODE,
  RENDERER_CALLBACK,
  USE_REACT_STRICT_MODE,
  MODERN_SATISFIES_TOKEN,
  REACT_SERVER_RENDER_MODE,
  DEFAULT_ERROR_BOUNDARY_COMPONENT,
} from '@tramvai/tokens-render';
import { PageErrorStore, setPageErrorEvent, beforeResolveHooksToken } from '@tramvai/module-router';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/module-common';
import { rendering as renderInBrowser } from './client';
import type { RenderModuleConfig } from './shared/types';
import { LayoutModule } from './shared/LayoutModule';
import { providers as sharedProviders } from './shared/providers';

export { PageErrorStore, setPageErrorEvent };
export * from '@tramvai/tokens-render';

export const DEFAULT_POLYFILL_CONDITION = '';

const throwErrorInDev = (logger: typeof LOGGER_TOKEN) => {
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${RESOURCES_REGISTRY} следует использовать только при SSR`);
  }
};

@Module({
  imports: [LayoutModule],
  providers: [
    ...sharedProviders,
    provide({
      provide: beforeResolveHooksToken,
      multi: true,
      useFactory: ({ store }) => {
        return async () => {
          if (store.getState(PageErrorStore)) {
            store.dispatch(setPageErrorEvent(null));
          }
        };
      },
      deps: {
        store: STORE_TOKEN,
      },
    }),
    provide({
      provide: RESOURCES_REGISTRY,
      useFactory: ({ logger }: { logger: typeof LOGGER_TOKEN }) => ({
        getPageResources: () => {
          throwErrorInDev(logger);
          return [];
        },
        register: () => throwErrorInDev(logger),
      }),
      deps: {
        logger: LOGGER_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.generatePage,
      useFactory: (deps) => {
        return function renderClientCommand() {
          (window as any).contextExternal = deps.consumerContext;
          return renderInBrowser(deps);
        };
      },
      deps: {
        logger: LOGGER_TOKEN,
        customRender: { token: CUSTOM_RENDER, optional: true },
        extendRender: { token: EXTEND_RENDER, optional: true },
        rendererCallback: { token: RENDERER_CALLBACK, optional: true },
        consumerContext: CONTEXT_TOKEN,
        di: DI_TOKEN,
        useStrictMode: USE_REACT_STRICT_MODE,
        renderMode: optional(REACT_SERVER_RENDER_MODE),
        defaultErrorBoundary: optional(DEFAULT_ERROR_BOUNDARY_COMPONENT),
      },
      multi: true,
    }),
    provide({
      provide: RENDERER_CALLBACK,
      useFactory:
        ({ consumerContext }) =>
        () => {
          consumerContext.di.register({ provide: '__TRAMVAI_HYDRATED', useValue: true });
        },
      deps: {
        consumerContext: CONTEXT_TOKEN,
      },
    }),
    provide({
      provide: USE_REACT_STRICT_MODE,
      useFactory: ({ deprecatedMode }) => {
        if (deprecatedMode === 'strict') {
          return true;
        }
        return false;
      },
      deps: {
        deprecatedMode: RENDER_MODE,
      },
    }),
    provide({
      provide: RENDER_MODE,
      useValue: 'legacy',
    }),
    provide({
      provide: MODERN_SATISFIES_TOKEN,
      useFactory: ({ cookieManager }) => {
        const result = cookieManager.get('_t_modern');

        return result === 'true' || result === 'false' ? JSON.parse(result) : false;
      },
      deps: {
        cookieManager: COOKIE_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: REACT_SERVER_RENDER_MODE,
      useValue: 'sync',
    }),
  ],
})
export class RenderModule {
  static forRoot({ mode, useStrictMode }: RenderModuleConfig) {
    const providers = [];

    if (typeof mode === 'string' || typeof useStrictMode === 'boolean') {
      providers.push({
        provide: USE_REACT_STRICT_MODE,
        useValue: useStrictMode ?? mode === 'strict',
      });
    }

    return {
      mainModule: RenderModule,
      providers,
    };
  }
}
