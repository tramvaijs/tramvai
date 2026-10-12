export interface StreamingRegistry {
  get(key: string): Promise<unknown>;
  resolve(key: string, data: unknown): void;
  reject(key: string, details?: { name?: string; message?: string; status?: number }): void;
  emit(channel: string, payload: unknown): void;
  subscribe(channel: string, listener: (payload: any) => void): void;
}

/**
 * Client-side registry of the data streamed after the application shell.
 *
 * Streamed inline scripts can be executed before the client code is loaded, and vice versa,
 * so every value and channel is created by whoever comes first.
 *
 * Function is stringified into inline script, so it must not reference anything from the outer scope.
 */
export function createStreamingRegistry(): StreamingRegistry {
  const values: Record<
    string,
    { promise: Promise<unknown>; resolve: (data: unknown) => void; reject: (reason: Error) => void }
  > = {};
  const channels: Record<string, { queue: unknown[]; listener?: (payload: any) => void }> = {};

  const getValue = (key: string) => {
    if (!values[key]) {
      const value = {} as (typeof values)[string];

      value.promise = new Promise((resolve, reject) => {
        value.resolve = resolve;
        value.reject = reject;
      });
      // rejection is handled by the consumer
      value.promise.catch(() => {});
      values[key] = value;
    }

    return values[key];
  };

  const getChannel = (channel: string) => {
    if (!channels[channel]) {
      channels[channel] = { queue: [] };
    }

    return channels[channel];
  };

  return {
    get(key) {
      return getValue(key).promise;
    },
    resolve(key, data) {
      getValue(key).resolve(data);
    },
    reject(key, details) {
      // server error details are sent only in development mode
      const error = new Error(
        details && details.message
          ? `Streamed value is rejected at server-side: ${details.message}`
          : 'Streamed value is rejected at server-side'
      ) as Error & { status?: number };

      error.name = 'StreamedValueRejectedError';

      if (details && details.status) {
        error.status = details.status;
      }

      getValue(key).reject(error);
    },
    emit(channel, payload) {
      const target = getChannel(channel);

      if (target.listener) {
        target.listener(payload);
      } else {
        target.queue.push(payload);
      }
    },
    subscribe(channel, listener) {
      const target = getChannel(channel);
      const queued = target.queue;

      target.queue = [];
      target.listener = listener;
      queued.forEach(listener);
    },
  };
}
