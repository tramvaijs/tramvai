/* eslint-disable prefer-destructuring */
import isPromise from '@tinkoff/utils/is/promise';
import type {
  Context,
  Span,
  SpanOptions,
  TimeInput,
  Link,
  Attributes,
  AttributeValue,
} from '@opentelemetry/api';
import { generateTraceId, generateSpanId } from '../generateIds';
import type { PropagationCarrier, TraceParams, TramvaiTracer } from '../tokens';

class BrowserSpan implements Span {
  private readonly traceIdValue: string;
  private readonly spanIdValue: string;
  private nameValue: string;
  private endedValue = false;

  constructor(name: string) {
    this.nameValue = name;
    this.traceIdValue = generateTraceId();
    this.spanIdValue = generateSpanId();
  }

  spanContext(): { traceId: string; spanId: string; traceFlags: number } {
    return {
      traceId: this.traceIdValue,
      spanId: this.spanIdValue,
      traceFlags: 1,
    };
  }

  setAttribute(key: string, value: AttributeValue): this {
    return this;
  }

  setAttributes(attributes: Attributes): this {
    return this;
  }

  addEvent(
    name: string,
    attributesOrStartTime?: Attributes | TimeInput,
    startTime?: TimeInput
  ): this {
    return this;
  }

  addLink(link: Link): this {
    return this;
  }

  addLinks(links: Link[]): this {
    return this;
  }

  setStatus(status: { code: number; message?: string }): this {
    return this;
  }

  updateName(name: string): this {
    this.nameValue = name;
    return this;
  }

  end(endTime?: TimeInput): void {
    this.endedValue = true;
  }

  isRecording(): boolean {
    return !this.endedValue;
  }

  recordException(exception: any, time?: TimeInput): void {}
}

export class BrowserTracer implements TramvaiTracer {
  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return new BrowserSpan(name);
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
    context: Context,
    fn: F
  ): ReturnType<F>;

  startActiveSpan(...args: any[]) {
    const name = args[0];
    const fn = args[args.length - 1];
    const options = args.length > 2 ? args[1] : {};
    const span = this.startSpan(name, options);

    return fn(span);
  }

  getActiveSpan(): Span | undefined {
    return undefined;
  }

  trace<T>(name: string, fn: (span: Span) => Promise<T>, params?: TraceParams): Promise<T>;
  trace<T>(name: string, fn: (span: Span) => T, params?: TraceParams): T;
  trace<T>(
    name: string,
    options: SpanOptions,
    fn: (span: Span) => Promise<T>,
    params?: TraceParams
  ): Promise<T>;

  trace<T>(name: string, options: SpanOptions, fn: (span: Span) => T, params?: TraceParams): T;

  trace<T extends Promise<unknown> | unknown>(...args: any[]): T {
    const name = args[0];
    let fn: (span: Span) => T;
    let options: SpanOptions;

    if (args.length === 2 || (args.length === 3 && typeof args[2] === 'object')) {
      fn = args[1];
      options = {};
    } else {
      options = args[1] ?? {};
      fn = args[2];
    }

    const span = this.startSpan(name, options);

    try {
      const result = fn(span);

      if (isPromise(result)) {
        return result.then(
          (res) => {
            span.end();
            return res;
          },
          (error) => {
            span.end();
            throw error;
          }
        ) as T;
      }

      span.end();
      return result;
    } catch (error) {
      span.end();
      throw error;
    }
  }

  propagateContext(carrier?: PropagationCarrier): PropagationCarrier {
    return carrier ?? {};
  }
}
