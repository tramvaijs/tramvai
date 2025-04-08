import { Scope, createToken } from '@tinkoff/dippy';
import type { Context, Span, SpanOptions } from '@opentelemetry/api';
import type {
  SpanProcessor,
  TracerConfig,
  BasicTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import type { Resource, ResourceAttributes } from '@opentelemetry/resources';

export type TraceParams = {
  skipError?: (error: Error) => boolean;
};

/**
 * API inspired by:
 * - https://github.com/DataDog/dd-trace-js/blob/59e9a2a75f4256755b4e6c9951a0bdf8d39b4015/index.d.ts#L9
 * - https://github.com/vercel/next.js/blob/9a1cd356dbafbfcf23d1b9ec05f772f766d05580/packages/next/src/server/lib/trace/tracer.ts#L74
 */
export interface TramvaiTracer {
  startSpan(name: string, options?: SpanOptions, context?: Context): Span;

  startActiveSpan<F extends (span: Span) => unknown>(name: string, fn: F): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>;

  getActiveSpan(): Span | undefined;

  // setSpan and other from TraceAPI?

  trace<T>(name: string, fn: (span: Span) => Promise<T>, params?: TraceParams): Promise<T>;
  trace<T>(name: string, fn: (span: Span) => T, params?: TraceParams): T;
  trace<T>(
    name: string,
    options: SpanOptions,
    fn: (span: Span) => Promise<T>,
    params?: TraceParams
  ): Promise<T>;
  trace<T>(name: string, options: SpanOptions, fn: (span: Span) => T, params?: TraceParams): T;

  // wrap
}

export const OPENTELEMETRY_PROVIDER_TOKEN = createToken<BasicTracerProvider>(
  'tramvai opentelemetry provider',
  { scope: Scope.SINGLETON }
);

export const OPENTELEMETRY_PROVIDER_CONFIG_TOKEN = createToken<TracerConfig>(
  'tramvai opentelemetry provider config',
  { scope: Scope.SINGLETON }
);

export const OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN = createToken<SpanProcessor>(
  'tramvai opentelemetry provider span processor',
  { multi: true, scope: Scope.SINGLETON }
);

export const OPENTELEMETRY_PROVIDER_RESOURCE_TOKEN = createToken<Resource>(
  'tramvai opentelemetry provider resource',
  { scope: Scope.SINGLETON }
);

export const OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN = createToken<ResourceAttributes>(
  'tramvai opentelemetry provider resource attributes',
  { multi: true, scope: Scope.SINGLETON }
);

export const OPENTELEMETRY_TRACER_TOKEN = createToken<TramvaiTracer>(
  'tramvai opentelemetry tracer',
  { scope: Scope.SINGLETON }
);
