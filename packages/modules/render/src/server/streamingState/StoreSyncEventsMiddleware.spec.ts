import type { Duplex } from 'stream';
import { StoreSyncEventsMiddleware } from './StoreSyncEventsMiddleware';

describe('server/streamedStateSync/StoreSyncEventsMiddleware', () => {
  const createHarness = ({
    serialize = (event: any) => JSON.stringify(event),
    isDeferredExecution = true,
  }: { serialize?: (event: any) => string; isDeferredExecution?: boolean } = {}) => {
    const tasks: Array<() => Promise<void>> = [];
    const responseTaskManager = {
      push: jest.fn((task: () => Promise<void>) => {
        tasks.push(task);
      }),
    } as any;

    const streamPushes: string[] = [];
    const serverResponseStream = {
      push: jest.fn((chunk: string) => {
        streamPushes.push(chunk);
      }),
    } as unknown as Duplex;

    const warn = jest.fn();
    const logger = jest.fn(() => ({ warn })) as any;

    const storage = {
      getStore: jest.fn(() => ({ isDeferredExecution })),
    } as any;

    const mw = StoreSyncEventsMiddleware(
      responseTaskManager,
      serverResponseStream,
      serialize,
      logger,
      storage
    );

    const next = jest.fn((event: any) => `result:${event.type}`);
    const run = mw({} as any)(next as any) as (event: any) => any;

    const flush = async () => {
      for (const task of tasks) {
        // eslint-disable-next-line no-await-in-loop
        await task();
      }
    };

    return { mw, run, next, flush, responseTaskManager, streamPushes, warn };
  };

  const successEvent = () => ({
    type: 'myReducer_success',
    payload: { data: 'ok' },
    store: { storeName: 'myReducer' },
  });

  it('does not stream events dispatched before startStreaming()', () => {
    const { run, next, responseTaskManager } = createHarness();

    const result = run(successEvent());

    expect(next).toHaveBeenCalledTimes(1);
    expect(result).toBe('result:myReducer_success');
    expect(responseTaskManager.push).not.toHaveBeenCalled();
  });

  it('streams events after startStreaming() as an inline push script', async () => {
    const { mw, run, responseTaskManager, streamPushes, flush } = createHarness();

    mw.startStreaming();
    const result = run(successEvent());

    expect(result).toBe('result:myReducer_success');
    expect(responseTaskManager.push).toHaveBeenCalledTimes(1);

    await flush();

    expect(streamPushes).toHaveLength(1);
    expect(streamPushes[0]).toBe(
      `<script>window.__TRAMVAI_STREAMED_EVENTS.push({"type":"myReducer_success","payload":{"data":"ok"},"store":"myReducer"});</script>`
    );
  });

  it('does not stream events without a deferred action marker after startStreaming()', () => {
    const { mw, run, next, responseTaskManager } = createHarness({
      isDeferredExecution: false,
    });

    mw.startStreaming();
    const result = run(successEvent());

    expect(next).toHaveBeenCalledTimes(1);
    expect(result).toBe('result:myReducer_success');
    expect(responseTaskManager.push).not.toHaveBeenCalled();
  });

  it('serializes store as null when the event has no store', async () => {
    const { mw, run, streamPushes, flush } = createHarness();

    mw.startStreaming();
    run({ type: 'globalEvent', payload: 1, store: undefined });

    await flush();

    expect(streamPushes[0]).toContain('"store":null');
  });

  it('skips the event with a warning when serialization throws, without breaking dispatch', async () => {
    const { mw, run, next, responseTaskManager, streamPushes, warn, flush } = createHarness({
      serialize: (event) => {
        if (event.payload.throwError) {
          throw new Error('cannot serialize');
        }
        return JSON.stringify(event);
      },
    });

    mw.startStreaming();
    const result1 = run({
      ...successEvent(),
      payload: { throwError: true },
    });
    const result2 = run(successEvent());

    expect(next).toHaveBeenCalledTimes(2);
    expect(result1).toBe('result:myReducer_success');
    expect(result2).toBe('result:myReducer_success');
    expect(responseTaskManager.push).toHaveBeenCalledTimes(2);

    await flush();

    expect(streamPushes).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'streamed-state-sync:non-serializable-payload' })
    );
  });
});
