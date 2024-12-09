import { Scope, commandLineListTokens, createApp, createToken, provide } from '@tramvai/core';
import { CommonModule } from '@tramvai/module-common';
import { RenderModule } from '@tramvai/module-render';
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
  ],
});
