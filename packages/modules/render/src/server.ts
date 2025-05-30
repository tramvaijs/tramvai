import { Module, commandLineListTokens, DI_TOKEN, provide } from '@tramvai/core';
import {
  LOGGER_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
  CONTEXT_TOKEN,
  CREATE_CACHE_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
} from '@tramvai/tokens-common';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { ClientHintsModule, USER_AGENT_TOKEN } from '@tramvai/module-client-hints';
import {
  RESOURCES_REGISTRY,
  RENDER_SLOTS,
  CUSTOM_RENDER,
  POLYFILL_CONDITION,
  EXTEND_RENDER,
  HTML_ATTRS,
  RESOURCE_INLINE_OPTIONS,
  ResourceType,
  RENDER_FLOW_AFTER_TOKEN,
  BACK_FORWARD_CACHE_ENABLED,
  REACT_SERVER_RENDER_MODE,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_STREAMING_RENDER_TIMEOUT,
  ASSETS_PREFIX_TOKEN,
  DEFAULT_ASSETS_PREFIX_TOKEN,
  INLINE_WEBPACK_RUNTIME,
} from '@tramvai/tokens-render';
import { Scope, optional } from '@tinkoff/dippy';
import { satisfies } from '@tinkoff/user-agent';
import { isRedirectFoundError } from '@tinkoff/errors';
import { PageErrorStore, setPageErrorEvent, deserializeError } from '@tramvai/module-router';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/module-common';
import {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { RESOURCE_INLINER, RESOURCES_REGISTRY_CACHE, ResourcesInliner } from './resourcesInliner';
import { ResourcesRegistry } from './resourcesRegistry';
import { PageBuilder } from './server/PageBuilder';
import { htmlPageSchemaFactory } from './server/htmlPageSchema';
import { ReactRenderServer } from './server/ReactRenderServer';
import type { RenderModuleConfig } from './shared/types';
import { LayoutModule } from './shared/LayoutModule';
import { providers as sharedProviders } from './shared/providers';
import { fetchWebpackStats } from './server/blocks/utils/fetchWebpackStats';

export { PageErrorStore, setPageErrorEvent };
export * from '@tramvai/tokens-render';

const REQUEST_TTL = 5 * 60 * 1000;

/**
 * @description
 * Default sizes for resource inliner cache
 */
const RESOURCES_REGISTRY_FILES_CACHE_SIZE = 300;
const RESOURCES_REGISTRY_SIZE_CACHE_SIZE = 300;
const RESOURCES_REGISTRY_DISABLED_URL_CACHE_SIZE = 300;

const RESOURCES_REGISTRY_FILES_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const RESOURCES_REGISTRY_SIZE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export const DEFAULT_POLYFILL_CONDITION = 'false';

@Module({
  imports: [ClientHintsModule, LayoutModule],
  providers: [
    ...sharedProviders,
    provide({
      provide: RESOURCES_REGISTRY,
      useClass: ResourcesRegistry,
      deps: {
        resourceInliner: RESOURCE_INLINER,
      },
    }),
    provide({
      provide: RESOURCES_REGISTRY_CACHE,
      scope: Scope.SINGLETON,
      useFactory: ({ createCache, resourceInlineOptions }) => {
        let filesCacheSize = RESOURCES_REGISTRY_FILES_CACHE_SIZE;
        let sizeCacheSize = RESOURCES_REGISTRY_SIZE_CACHE_SIZE;
        let disabledUrlCacheSize = RESOURCES_REGISTRY_DISABLED_URL_CACHE_SIZE;

        if (resourceInlineOptions && resourceInlineOptions.cacheSize) {
          filesCacheSize = resourceInlineOptions.cacheSize.files;
          sizeCacheSize = resourceInlineOptions.cacheSize.size;
          disabledUrlCacheSize = resourceInlineOptions.cacheSize.disabledUrl;
        }

        return {
          filesCache: createCache('memory', {
            name: 'resource-inliner-files',
            max: filesCacheSize,
            ttl: RESOURCES_REGISTRY_FILES_CACHE_TTL,
          }),
          sizeCache: createCache('memory', {
            name: 'resource-inliner-sizes',
            max: sizeCacheSize,
            ttl: RESOURCES_REGISTRY_SIZE_CACHE_TTL,
          }),
          disabledUrlsCache: createCache('memory', {
            name: 'resource-inliner-disabled-urls',
            max: disabledUrlCacheSize,
            ttl: REQUEST_TTL,
          }),
        };
      },
      deps: {
        createCache: CREATE_CACHE_TOKEN,
        resourceInlineOptions: { token: RESOURCE_INLINE_OPTIONS, optional: true },
      },
    }),
    provide({
      provide: RESOURCE_INLINER,
      scope: Scope.SINGLETON,
      useClass: ResourcesInliner,
      deps: {
        resourcesRegistryCache: RESOURCES_REGISTRY_CACHE,
        resourceInlineThreshold: { token: RESOURCE_INLINE_OPTIONS, optional: true },
        logger: LOGGER_TOKEN,
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.generatePage,
      useFactory: ({
        htmlBuilder,
        logger,
        requestManager,
        responseManager,
        context,
        bfcacheEnabled,
        pageService,
      }) => {
        const log = logger('module-render');

        // eslint-disable-next-line max-statements
        return async function render() {
          const pageErrorBoundary = pageService.resolveComponentFromConfig('errorBoundary');
          let html: string;

          try {
            html = await htmlBuilder.flow();
          } catch (error) {
            // if there is no Page Error Boundary, will try to render Root Error Boundary later in error handler
            if (!pageErrorBoundary) {
              throw error;
            }

            // assuming that there was an error when rendering the page, try to render again with Page Error Boundary
            try {
              context.dispatch(setPageErrorEvent(error));

              html = await htmlBuilder.flow();

              log.info({
                event: 'render-page-error-boundary',
                message: 'Render Page Error Boundary for the client',
              });
            } catch (e) {
              log.warn({
                event: 'failed-page-error-boundary',
                message: 'Page Error Boundary rendering failed',
                error: e,
              });

              // pass page render error to default error handler
              throw error;
            }
          }

          const pageRenderError = context.getState(PageErrorStore);

          // if there is no Page Error Boundary and page error exists, that means that page render was interrupted and current `html` is invalid
          // if it is RedirectFoundError, also pass it to default error handler
          if (
            pageRenderError &&
            (!pageErrorBoundary || isRedirectFoundError(pageRenderError as Error))
          ) {
            throw pageRenderError;
          }

          // log send-server-error only after successful Page Boundary render,
          // otherwise this event will be logged in default error handler
          if (pageRenderError) {
            const status = pageRenderError.httpStatus || 500;
            const error = deserializeError(pageRenderError);
            const requestInfo = {
              ip: requestManager.getClientIp(),
              requestId: requestManager.getHeader('x-request-id'),
              url: requestManager.getUrl(),
            };

            if ('httpStatus' in pageRenderError) {
              if (pageRenderError.httpStatus >= 500) {
                log.error({
                  event: 'send-server-error',
                  message: `This is expected server error, here is most common cases:
- Forced Page Error Boundary render with 5xx code in Guard or Action - https://tramvai.dev/docs/features/error-boundaries#force-render-page-error-boundary-in-action.
Page Error Boundary will be rendered for the client`,
                  error,
                  requestInfo,
                });
              } else {
                log.info({
                  event: 'http-error',
                  message: `This is expected server error, here is most common cases:
- Forced Page Error Boundary render with 4xx code in Guard or Action - https://tramvai.dev/docs/features/error-boundaries#force-render-page-error-boundary-in-action.
Page Error Boundary will be rendered for the client`,
                  error,
                  requestInfo,
                });
              }
            } else {
              log.error({
                event: 'send-server-error',
                message: `Unexpected server error. Error cause will be in "error" parameter.
Most likely an error has occurred in the rendering of the current React page component.
Page Error Boundary will be rendered for the client`,
                error,
                requestInfo,
              });
            }

            responseManager.setStatus(status);
          }

          // Проставляем не кэширующие заголовки
          // TODO Заменить после выкатки на прод и прохода всех тестов на cache-control = no-cache,no-store,max-age=0,must-revalidate
          responseManager.setHeader('expires', '0');
          responseManager.setHeader('pragma', 'no-cache');
          responseManager.setHeader(
            'cache-control',
            `${bfcacheEnabled ? '' : 'no-store, '}no-cache, must-revalidate`
          );

          responseManager.setBody(html);
        };
      },
      deps: {
        logger: LOGGER_TOKEN,
        requestManager: REQUEST_MANAGER_TOKEN,
        responseManager: RESPONSE_MANAGER_TOKEN,
        htmlBuilder: 'htmlBuilder',
        context: CONTEXT_TOKEN,
        pageService: PAGE_SERVICE_TOKEN,
        bfcacheEnabled: BACK_FORWARD_CACHE_ENABLED,
      },
    }),
    provide({
      provide: 'htmlBuilder',
      useClass: PageBuilder,
      deps: {
        reactRender: 'reactRender',
        pageService: PAGE_SERVICE_TOKEN,
        resourcesRegistry: RESOURCES_REGISTRY,
        context: CONTEXT_TOKEN,
        htmlPageSchema: 'htmlPageSchema',
        renderSlots: { token: RENDER_SLOTS, optional: true },
        polyfillCondition: POLYFILL_CONDITION,
        htmlAttrs: HTML_ATTRS,
        renderFlowAfter: { token: RENDER_FLOW_AFTER_TOKEN, optional: true },
        logger: LOGGER_TOKEN,
        fetchWebpackStats: FETCH_WEBPACK_STATS_TOKEN,
        inlineWebpackRuntime: INLINE_WEBPACK_RUNTIME,
        di: DI_TOKEN,
        renderMode: optional(REACT_SERVER_RENDER_MODE),
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
    provide({
      provide: 'reactRender',
      useClass: ReactRenderServer,
      deps: {
        context: CONTEXT_TOKEN,
        customRender: { token: CUSTOM_RENDER, optional: true },
        extendRender: { token: EXTEND_RENDER, optional: true },
        di: DI_TOKEN,
        renderMode: optional(REACT_SERVER_RENDER_MODE),
        logger: LOGGER_TOKEN,
        responseTaskManager: SERVER_RESPONSE_TASK_MANAGER,
        responseStream: SERVER_RESPONSE_STREAM,
        streamingTimeout: REACT_STREAMING_RENDER_TIMEOUT,
        deferredActions: DEFERRED_ACTIONS_MAP_TOKEN,
      },
    }),
    provide({
      provide: 'htmlPageSchema',
      useFactory: htmlPageSchemaFactory,
      deps: {
        htmlAttrs: HTML_ATTRS,
      },
    }),
    provide({
      provide: HTML_ATTRS,
      useValue: {
        target: 'html',
        attrs: {
          class: 'no-js',
          lang: 'ru',
        },
      },
      multi: true,
    }),
    provide({
      provide: HTML_ATTRS,
      useValue: {
        target: 'app',
        attrs: {
          class: 'application',
        },
      },
      multi: true,
    }),
    provide({
      provide: POLYFILL_CONDITION,
      useValue: DEFAULT_POLYFILL_CONDITION,
    }),
    provide({
      // by default, enable inlining for css files with size below 40kb before gzip
      provide: RESOURCE_INLINE_OPTIONS,
      useValue: {
        threshold: 40960, // 40kb before gzip, +-10kb after gzip
        types: [ResourceType.style],
        cacheSize: {
          files: RESOURCES_REGISTRY_FILES_CACHE_SIZE,
          size: RESOURCES_REGISTRY_SIZE_CACHE_SIZE,
          disabledUrl: RESOURCES_REGISTRY_DISABLED_URL_CACHE_SIZE,
        },
      },
    }),
    provide({
      provide: ASSETS_PREFIX_TOKEN,
      useFactory: ({ defaultAssetsPrefix }) => {
        return () => defaultAssetsPrefix;
      },
      deps: {
        defaultAssetsPrefix: DEFAULT_ASSETS_PREFIX_TOKEN,
      },
    }),
    provide({
      provide: DEFAULT_ASSETS_PREFIX_TOKEN,
      useValue: process.env.ASSETS_PREFIX ?? null,
    }),
    provide({
      provide: FETCH_WEBPACK_STATS_TOKEN,
      useFactory: (deps) => {
        return fetchWebpackStats(deps);
      },
      deps: {
        assetsPrefixFactory: ASSETS_PREFIX_TOKEN,
      },
    }),
    provide({
      provide: BACK_FORWARD_CACHE_ENABLED,
      useValue: true,
    }),
    provide({
      provide: INLINE_WEBPACK_RUNTIME,
      useValue: false,
    }),
    provide({
      provide: REACT_SERVER_RENDER_MODE,
      useValue: 'sync',
    }),
    provide({
      provide: REACT_STREAMING_RENDER_TIMEOUT,
      useValue: 5000,
    }),
  ],
})
export class RenderModule {
  static forRoot({ polyfillCondition }: RenderModuleConfig) {
    const providers = [];

    if (typeof polyfillCondition === 'string') {
      providers.push({
        provide: POLYFILL_CONDITION,
        useValue: polyfillCondition,
      });
    }

    return {
      mainModule: RenderModule,
      providers,
    };
  }
}
export { ReactRenderServer } from './server/ReactRenderServer';
