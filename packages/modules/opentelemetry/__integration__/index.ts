import { Scope, commandLineListTokens, createApp, createToken, provide } from '@tramvai/core';
import { CommonModule, ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/module-common';
import { RenderModule, ResourceSlot, ResourceType } from '@tramvai/module-render';
import { SERVER_MODULE_PAPI_PUBLIC_ROUTE, ServerModule } from '@tramvai/module-server';
import { modules } from '@tramvai/internal-test-utils/shared/common';
import {
  OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN,
  OPENTELEMETRY_TRACER_TOKEN,
  OpenTelemetryModule,
} from '@tramvai/module-opentelemetry';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { createPapiMethod } from '@tramvai/papi';
import { safeStringifyJSON } from '@tramvai/safe-strings';
import { HTTP_CLIENT_FACTORY } from '@tramvai/tokens-http-client';
import { MockerModule } from '@tramvai/module-mocker';
import { RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import { OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN } from '../src/tokens';

const IN_MEMORY_SPAN_EXPORTER = createToken<InMemorySpanExporter>(
  'opentelemetry in-memory span exporter',
  {
    scope: Scope.SINGLETON,
  }
);

createApp({
  name: 'opentelemetry-app',
  modules: [
    OpenTelemetryModule,
    CommonModule,
    RenderModule.forRoot({ useStrictMode: true }),
    ServerModule,
    MockerModule,
    ...modules,
  ],
  bundles: {
    test: () => import(/* webpackChunkName: "test" */ './bundles/testPage'),
  },
  providers: [
    ...(typeof window === 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.customerStart,
            useFactory: ({ tracer }) => {
              return function customSpan() {
                return tracer.trace('customerStart', async () => {
                  await new Promise((resolve) => setTimeout(resolve, 100));
                });
              };
            },
            deps: {
              tracer: OPENTELEMETRY_TRACER_TOKEN,
            },
          }),
        ]
      : []),
    provide({
      provide: OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN,
      useFactory: ({ exporter }) => {
        return new SimpleSpanProcessor(exporter);
      },
      deps: {
        exporter: IN_MEMORY_SPAN_EXPORTER,
      },
    }),
    // for testing purposes, save all traces in-memory
    provide({
      provide: IN_MEMORY_SPAN_EXPORTER,
      useFactory: () => {
        return new InMemorySpanExporter();
      },
    }),
    // provide papi handler with all stored in-memory traces
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      useFactory: ({ exporter }) => {
        return createPapiMethod({
          method: 'get',
          path: '/trace-exporter-get',
          async handler() {
            const traces = exporter.getFinishedSpans();

            return safeStringifyJSON(traces);
          },
        });
      },
      deps: {
        exporter: IN_MEMORY_SPAN_EXPORTER,
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      useFactory: ({ exporter }) => {
        return createPapiMethod({
          method: 'get',
          path: '/trace-exporter-clear',
          async handler() {
            exporter.reset();
            return 'ok';
          },
        });
      },
      deps: {
        exporter: IN_MEMORY_SPAN_EXPORTER,
      },
    }),
    provide({
      provide: 'MOCK_HTTP_CLIENT',
      useFactory: ({ factory, envManager }) => {
        return factory({
          name: 'httpbin',
          baseUrl: envManager.get('MOCK_API'),
        });
      },
      deps: {
        factory: HTTP_CLIENT_FACTORY,
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      useValue: [{ key: 'MOCK_API' }],
    }),
    provide({
      provide: commandLineListTokens.customerStart,
      useFactory:
        ({ httpClient, resourcesRegistry }) =>
        async () => {
          const [{ payload }] = await Promise.all([
            httpClient.get('/json'),
            httpClient.get('/filtered-json'),
          ]);

          if (typeof window === 'undefined') {
            resourcesRegistry.register({
              slot: ResourceSlot.HEAD_META,
              type: ResourceType.asIs,
              payload: `<script id="server-mock-request">${JSON.stringify(payload)}</script>`,
            });
          }
        },
      deps: {
        httpClient: 'MOCK_HTTP_CLIENT',
        resourcesRegistry: RESOURCES_REGISTRY,
      },
    }),
    provide({
      provide: OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN,
      useValue: (url: string) => {
        const blacklist = ['/filtered-json'];

        return !blacklist.some((blockerUrl) => url.includes(blockerUrl));
      },
    }),
  ],
});
