import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import fp from 'fastify-plugin';
import { HttpError } from '@tinkoff/errors';
import onFinished from 'on-finished';
import type { IntervalHistogram } from 'perf_hooks';
import { monitorEventLoopDelay } from 'perf_hooks';
import { DoubleLinkedList } from './utils/doubleLinkedList';

export const DEFAULT_OPTIONS = {
  limit: 10,
  queue: 100,
  maxEventLoopDelay: 150,
  error: { httpStatus: 429, message: 'Too Many Requests' },
};

export interface RequestLimiterOptions {
  limit?: number;
  queue?: number;
  maxEventLoopDelay?: number;
  error?: {
    httpStatus: number;
    message: string;
  };
}

export type RequestQueuedResult = 'drop' | 'take';

export interface RequestsLimiterMetrics {
  collectQueueSize: (v: number) => void;
  collectQueueLimit: (v: number) => void;
  collectCurrentRequests: (v: number) => void;
  collectCurrentRequestsLimit: (v: number) => void;
  collectRequestsQueuedTime: (result: RequestQueuedResult, duration: number) => void;
}

export interface RequestLimiterRequest {
  req: FastifyRequest;
  res: FastifyReply;
  next: HookHandlerDoneFunction;
}

const resolution = 10;

export class RequestLimiter {
  private currentActive = 0;
  private eventLoopDelay = 0;
  private queue = new DoubleLinkedList<{
    requestLimiterRequest: RequestLimiterRequest;
    timestamp: number;
  }>();

  private activeRequestLimit: number;
  private queueLimit: number;
  private error: RequestLimiterOptions['error'];
  private minimalActiveRequestLimit: number;
  private maxEventLoopDelay: number;
  private eventLoopHistogram: IntervalHistogram;
  private metrics: RequestsLimiterMetrics;

  constructor(options: RequestLimiterOptions, metrics: RequestsLimiterMetrics) {
    const { limit, queue, maxEventLoopDelay, error } = options;

    this.activeRequestLimit = limit;
    this.minimalActiveRequestLimit = Math.round(limit / 3);
    this.queueLimit = queue;
    this.error = error;
    this.maxEventLoopDelay = maxEventLoopDelay;
    this.metrics = metrics;

    this.metrics.collectQueueLimit(this.queueLimit);
    this.eventLoopHistogram = monitorEventLoopDelay({ resolution });
    this.eventLoopHistogram.enable();
    const timer = setInterval(() => this.nextTick(), 1000);
    timer.unref();
  }

  onResponse() {
    this.updateCurrentActiveRequests(this.currentActive - 1);
    this.loop();
  }

  private updateCurrentActiveRequests(value) {
    this.currentActive = value;
    this.metrics.collectCurrentRequests(value);
  }

  private updateActiveRequestLimit(value: number) {
    this.activeRequestLimit = value;
    this.metrics.collectCurrentRequestsLimit(value);
  }

  // General idea is change limits every second. Because if DDOS was happened we need some time to get problem with event loop. And better if we slowly adapt
  private nextTick() {
    this.eventLoopDelay = Math.max(0, this.eventLoopHistogram.mean / 1e6 - resolution);
    if (Number.isNaN(this.eventLoopDelay)) this.eventLoopDelay = Infinity;
    this.eventLoopHistogram.reset();

    if (this.eventLoopDelay <= this.maxEventLoopDelay) {
      if (this.currentActive >= this.activeRequestLimit) {
        this.updateActiveRequestLimit(this.activeRequestLimit + 1);
      }
      // We need to have minimalActiveRequestLimit
    } else if (this.activeRequestLimit > this.minimalActiveRequestLimit) {
      this.updateActiveRequestLimit(this.activeRequestLimit - 1);
    }
  }

  add(request: RequestLimiterRequest) {
    if (this.currentActive < this.activeRequestLimit) {
      this.run(request);
      return;
    }

    if (this.queue.length >= this.queueLimit) {
      const { requestLimiterRequest, timestamp } = this.queue.shift();
      requestLimiterRequest.next(new HttpError(this.error));

      this.metrics.collectRequestsQueuedTime('drop', Date.now() - timestamp);
    }
    this.queue.push({ requestLimiterRequest: request, timestamp: Date.now() });
    this.metrics.collectQueueSize(this.queue.size());
  }

  private loop() {
    while (this.queue.length > 0 && this.currentActive < this.activeRequestLimit) {
      // better if we start with new requests. Because more opportunity to answer before client cancel request
      const { requestLimiterRequest, timestamp } = this.queue.pop();

      this.run(requestLimiterRequest);

      this.metrics.collectRequestsQueuedTime('take', Date.now() - timestamp);
      this.metrics.collectQueueSize(this.queue.size());
    }
  }

  private run({ next, res }: RequestLimiterRequest) {
    this.updateCurrentActiveRequests(this.currentActive + 1);

    // onFinished doesn't work OK in DEV mode. Just stuck with high load without any reasons
    // fastify: it only works this way with on-finished, as using hook `onRequest` is not enough to handle all of the requests
    // and some of the failed requests are getting disappeared
    // and other hooks useless as well. [related issue](https://github.com/fastify/fastify/issues/1352)
    onFinished(res.raw, () => {
      this.onResponse();
    });

    next();
  }
}

declare module 'fastify' {
  interface FastifyPluginOptions {
    requestsLimiter: RequestLimiter;
  }
}

export const fastifyRequestsLimiter = fp(async (fastify, { requestsLimiter }) => {
  fastify.addHook('onRequest', (req, res, next) => {
    requestsLimiter.add({ req, res, next });
  });
});
