import path from 'node:path';
import fs from 'node:fs';
import type { Writable } from 'node:stream';
import { createToken } from '@tinkoff/dippy';
import * as chromeTraceEvent from 'chrome-trace-event';

// eslint-disable-next-line prefer-destructuring
const pid = process.pid;
let tid: number;

try {
  tid = require('worker_threads').threadId;
} catch {
  tid = 0;
}

export type Trace = {
  event: string;
  category: string[];
  fields?: Record<string, any>;
};

export const TRACER_TOKEN = createToken<Tracer>('tramvai tracer');

// TODO: отдельный процесс для трейсера общий, который будет принимать postMessage ото всех?
// может на конкретном порту сервер поднимать?
/**
 * @description
 * Creates events in [Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview)
 *
 * @example Simple async operations tracing
 * ```ts
 * const tracer = new Tracer();
 *
 * tracer.wrap({ event: 'event' }, async () => {
 *  await doSomethingAsync();
 * });
 * ```
 *
 * @example Flexible tracing with manual ending
 * ```ts
 * const tracer = new Tracer();
 *
 * const complete = tracer.measure({ event: 'event' });
 *
 * setTimeout(() => {
 *  complete();
 * }, 1000);
 * ```
 *
 * @example Mark one-time event
 * ```ts
 * const tracer = new Tracer();
 *
 * tracer.mark({ event: 'event' });
 * ```
 *
 * @reference https://github.com/parcel-bundler/parcel/blob/v2/packages/core/profiler/src/Tracer.js
 */
export class Tracer {
  #tid = tid;
  #pid = pid;
  #cwd: string;
  #tracer?: chromeTraceEvent.Tracer;
  #stream?: Writable;
  #enabled = process.env.TRAMVAI_TRACER_ENABLED === 'true';
  #initialized = false;
  #key = process.env.__TRAMVAI_TRACER_FILENAME ?? 'tramvai';

  constructor({ cwd }: { cwd?: string }) {
    this.#cwd = cwd ?? process.cwd();

    if (!this.#enabled) {
      return;
    }

    this.#tracer = new chromeTraceEvent.Tracer();
  }

  mark({ event, category, fields }: Trace) {
    if (!this.#enabled) {
      return;
    }

    const start = performance.now();

    this.#tracer!.instantEvent({
      ...fields,
      name: event,
      cat: category,
      ts: millisecondsToMicroseconds(start),
      tid: this.#tid,
      pid: this.#pid,
    });
  }

  async wrap<R>(trace: Trace, fn: () => Promise<R>): Promise<R> {
    if (!this.#enabled) {
      return fn();
    }

    const complete = this.measure(trace);

    try {
      return await fn();
    } finally {
      complete();
    }
  }

  measure({ event, category, fields }: Trace) {
    if (!this.#enabled) {
      return () => {};
    }

    const start = performance.now();

    return () => {
      const duration = performance.now() - start;

      this.#tracer!.completeEvent({
        ...fields,
        name: event,
        cat: category,
        args: fields,
        ts: millisecondsToMicroseconds(start),
        dur: millisecondsToMicroseconds(duration),
        tid: this.#tid,
        pid: this.#pid,
      });
    };
  }

  init() {
    if (!this.#enabled || this.#initialized) {
      return;
    }
    this.#initialized = true;

    this.#stream = fs.createWriteStream(
      path.join(this.#cwd, `${this.#key}.${Date.now()}.trace.json`)
    );

    this.#tracer!.pipe(this.#stream);
  }

  finish() {
    this.#stream?.write(']', 'utf8');
    this.#stream?.end();
  }
}

// export as singleton to reuse in CLI wrapper
export const tracer = new Tracer({ cwd: process.cwd() });

function millisecondsToMicroseconds(milliseconds: number) {
  return Math.floor(milliseconds * 1000);
}
