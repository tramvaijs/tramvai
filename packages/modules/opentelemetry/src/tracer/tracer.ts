/* eslint-disable prefer-destructuring */
import isPromise from '@tinkoff/utils/is/promise';
import type { Context, Span, SpanOptions, Tracer } from '@opentelemetry/api';
import { trace, context, SpanStatusCode, ROOT_CONTEXT } from '@opentelemetry/api';
import { isSilentError } from '@tinkoff/errors';
import type { TraceParams, TramvaiTracer } from '../tokens';

function recordAndThrowError(span: Span, error: any, { skipError = () => false }: TraceParams) {
  span.recordException(error);

  if (!(skipError(error) || isSilentError(error))) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message ?? 'Unknown error',
    });
  }

  span.end();

  throw error;
}

export class TramvaiTracerImpl implements TramvaiTracer {
  private tracer: Tracer;

  constructor({ tracer }: { tracer: Tracer }) {
    this.tracer = tracer;
  }

  startSpan(...args: any[]): Span {
    // @ts-expect-error
    return this.tracer.startSpan(...args);
  }

  startActiveSpan<F extends (span: Span) => unknown>(name: string, fn: F): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    fn: F
  ): ReturnType<F>;

  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    ctx: Context,
    fn: F
  ): ReturnType<F>;

  startActiveSpan(...args: any[]) {
    // @ts-expect-error
    return this.tracer.startActiveSpan(...args);
  }

  getActiveSpan(): Span | undefined {
    return trace.getSpan(context.active());
  }

  trace<T>(name: string, fn: (span: Span) => Promise<T>, params?: TraceParams): Promise<T>;

  trace<T>(name: string, fn: (span: Span) => T, params?: TraceParams): T;
  trace<T>(
    name: string,
    options: SpanOptions,
    fn: (span: Span) => Promise<T>,
    params?: TraceParams
  ): Promise<T>;

  trace<T>(name: string, options: SpanOptions, fn: (span: Span, params?: TraceParams) => T): T;

  trace<T extends Promise<unknown> | unknown>(...args: any[]) {
    const name = args[0];
    let fn: (span: Span, done?: (error?: Error) => any) => T;
    let options: SpanOptions;
    let params: TraceParams;

    if (args.length === 2 || (args.length === 3 && typeof args[2] === 'object')) {
      fn = args[1];
      options = {};
      params = args[2] || {};
    } else {
      fn = args[2];
      options = args[1];
      params = args[3] || {};
    }

    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan ? trace.setSpan(context.active(), activeSpan) : undefined;
    const ctx: Context = spanContext ?? context.active() ?? ROOT_CONTEXT;

    return this.startActiveSpan(name, options, ctx, (span) => {
      try {
        const result = fn(span);

        // wrap promise fn, end span if promise is resolved or rejected
        if (isPromise(result)) {
          return result
            .then((res: any) => {
              span.end();
              return res;
            })
            .catch((error: any) => {
              recordAndThrowError(span, error, params);
            });
        }

        // otherwise, end span immediately
        span.end();

        return result;
      } catch (error: any) {
        recordAndThrowError(span, error, params);
      }
    });
  }
}
/* eslint-enable prefer-destructuring */
