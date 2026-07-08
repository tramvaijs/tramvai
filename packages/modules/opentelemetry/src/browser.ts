import { Module, provide } from '@tramvai/core';
import once from '@tinkoff/utils/function/once';
import { providers as logsIntegrationProviders } from './instrumentation/logs.browser';
import { providers as httpClientInstrumentationProviders } from './instrumentation/httpClient.browser';
import { BrowserTracer } from './tracer/tracer.browser';
import { OPENTELEMETRY_TRACER_TOKEN } from './tokens';

export * from './tokens';
export { generateTraceId, generateSpanId } from './generateIds';
export { BrowserTracer } from './tracer/tracer.browser';

export const extractTraceparentHeader = once((): string | undefined => {
  if (typeof window !== 'undefined') {
    const traceparentMeta = Array.from(document.getElementsByTagName('meta')).filter(
      (element) => element.name === 'traceparent'
    );

    if (traceparentMeta.length !== 1) {
      return undefined;
    }

    return traceparentMeta[0].content;
  }

  return undefined;
});

@Module({
  imports: [],
  providers: [
    ...logsIntegrationProviders,
    ...httpClientInstrumentationProviders,
    provide({
      provide: OPENTELEMETRY_TRACER_TOKEN,
      useFactory: () => new BrowserTracer(),
    }),
  ],
})
export class OpenTelemetryModule {}
// todo declareModule!
