import { APP_INFO_TOKEN, Module, commandLineListTokens, optional, provide } from '@tramvai/core';
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import {
  OPENTELEMETRY_PROVIDER_CONFIG_TOKEN,
  OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN,
  OPENTELEMETRY_PROVIDER_RESOURCE_TOKEN,
  OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN,
  OPENTELEMETRY_PROVIDER_TOKEN,
  OPENTELEMETRY_TRACER_TOKEN,
} from './tokens';
import { TramvaiTracerImpl } from './tracer/tracer';
import { providers as serverInstrumentationProviders } from './instrumentation/server';
import { providers as httpClientInstrumentationProviders } from './instrumentation/httpClient';
import { providers as logsIntegrationProviders } from './instrumentation/logs';

export * from './tokens';

@Module({
  imports: [],
  providers: [
    ...serverInstrumentationProviders,
    ...httpClientInstrumentationProviders,
    ...logsIntegrationProviders,
    provide({
      provide: commandLineListTokens.init,
      useFactory: ({ provider }) => {
        return function initializeOpenTelemetryProvider() {
          provider.register();
        };
      },
      deps: {
        provider: OPENTELEMETRY_PROVIDER_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.close,
      useFactory: ({ provider, logger }) => {
        return function shutdownOpenTelemetryProvider() {
          const log = logger('opentelemetry');

          provider.shutdown().catch((error) => {
            log.error({
              event: 'provider-shutdown-error',
              error,
            });
          });
        };
      },
      deps: {
        provider: OPENTELEMETRY_PROVIDER_TOKEN,
        logger: LOGGER_TOKEN,
      },
    }),
    provide({
      provide: OPENTELEMETRY_PROVIDER_TOKEN,
      useFactory: ({ config }) => {
        return new NodeTracerProvider(config);
      },
      deps: {
        config: OPENTELEMETRY_PROVIDER_CONFIG_TOKEN,
      },
    }),
    // todo maybe not needed?
    provide({
      provide: OPENTELEMETRY_PROVIDER_CONFIG_TOKEN,
      useFactory: ({ resource, spanProcessors }) => {
        return { resource, spanProcessors: spanProcessors ?? [] };
      },
      deps: {
        resource: OPENTELEMETRY_PROVIDER_RESOURCE_TOKEN,
        spanProcessors: optional(OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN),
      },
    }),
    provide({
      provide: OPENTELEMETRY_PROVIDER_RESOURCE_TOKEN,
      useFactory: ({ attributesList }) => {
        const attributes = attributesList.reduce((acc, attribute) => {
          return {
            ...acc,
            ...attribute,
          };
        }, {});

        // todo async attributes
        return new Resource(attributes);
      },
      deps: {
        attributesList: OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN,
      },
    }),
    provide({
      provide: OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN,
      useFactory: ({ appInfo }) => {
        return {
          [ATTR_SERVICE_NAME]: appInfo.appName,
        };
      },
      deps: {
        appInfo: APP_INFO_TOKEN,
      },
    }),
    provide({
      provide: OPENTELEMETRY_TRACER_TOKEN,
      useFactory: ({ provider }) => {
        const tracer = provider.getTracer('tramvai', '1.0.0');

        return new TramvaiTracerImpl(tracer);
      },
      deps: {
        provider: OPENTELEMETRY_PROVIDER_TOKEN,
      },
    }),
    // todo open telemetry debug flag or wrap ConsoleSpanExporter in logger
    ...(process.env.NODE_ENV === 'development'
      ? [
          provide({
            provide: OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN,
            useFactory: () => {
              return new SimpleSpanProcessor(new ConsoleSpanExporter());
            },
          }),
        ]
      : []),
  ],
})
export class OpenTelemetryModule {}
// todo declareModule!
