import { ServerResponseTaskManager } from './taskManager';

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('ServerResponseTaskManager', () => {
  it('waits for tasks pushed while closing the queue', async () => {
    const taskManager = new ServerResponseTaskManager();
    let resolveFirst: () => void = () => {};
    let resolveLate: () => void = () => {};
    let closed = false;

    taskManager.push(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        })
    );
    taskManager.processQueue();
    taskManager.closeQueue().then(() => {
      closed = true;
    });

    // e.g. data streamed after suspended component is resolved
    taskManager.push(
      () =>
        new Promise<void>((resolve) => {
          resolveLate = resolve;
        })
    );
    resolveFirst();
    await flush();

    expect(closed).toBe(false);

    resolveLate();
    await flush();

    expect(closed).toBe(true);
  });

  it('ignores tasks after the queue is closed', async () => {
    const taskManager = new ServerResponseTaskManager();
    const task = jest.fn(async () => {});

    taskManager.processQueue();
    await taskManager.closeQueue();
    taskManager.push(task);

    expect(task).not.toHaveBeenCalled();
  });
});
