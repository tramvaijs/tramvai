import { PassThrough } from 'stream';
import { createStreamingTransport, streamingRegistryInitScript } from './transport';
import { STREAMING_REGISTRY_GLOBAL } from '../../shared/streamingTransport/constants';

const flush = () => new Promise((resolve) => setImmediate(resolve));

const setup = ({ shellSent = true } = {}) => {
  const tasks: Array<() => Promise<any>> = [];
  const chunks: string[] = [];
  const responseStream = new PassThrough();
  const originalPush = responseStream.push.bind(responseStream);

  responseStream.push = (chunk: any) => {
    if (chunk !== null) {
      chunks.push(chunk);
    }
    return originalPush(chunk);
  };
  responseStream.resume();

  const transport = createStreamingTransport({
    responseTaskManager: { push: (task: () => Promise<any>) => tasks.push(task) } as any,
    responseStream,
  });

  if (shellSent) {
    transport.onShellSent();
  }

  // the same as `ServerResponseTaskManager.processQueue` + `closeQueue`
  const processTasks = () => Promise.all(tasks.splice(0).map((task) => task()));

  return { transport, chunks, processTasks, responseStream };
};

/**
 * Fake page: registry from the head, and streamed scripts
 */
const createPage = () => {
  const window: Record<string, any> = {};
  const execute = (script: string) =>
    // eslint-disable-next-line no-new-func
    new Function('window', script.replace(/^<script>|<\/script>$/g, ''))(window);

  execute(streamingRegistryInitScript);

  return {
    registry: window[STREAMING_REGISTRY_GLOBAL],
    executeScripts: (chunks: string[]) => chunks.splice(0).forEach(execute),
    execute,
    window,
  };
};

describe('streaming transport', () => {
  it('init script is idempotent', () => {
    const page = createPage();

    page.execute(streamingRegistryInitScript);

    expect(page.window[STREAMING_REGISTRY_GLOBAL]).toBe(page.registry);
  });

  it('nothing is pushed before response tasks are processed', async () => {
    const { transport, chunks } = setup();

    transport.stream('key', Promise.resolve('data'));
    await flush();

    expect(chunks).toHaveLength(0);
  });

  it('scripts are queued only after the shell', async () => {
    const { transport, chunks, processTasks } = setup({ shellSent: false });

    transport.emit('channel', 1);
    await processTasks();

    expect(chunks).toHaveLength(0);

    transport.onShellSent();
    await processTasks();

    expect(chunks).toHaveLength(1);
  });

  it('resolves values, requested before and after they are streamed', async () => {
    const { transport, chunks, processTasks } = setup();
    const page = createPage();
    const requestedBefore = page.registry.get('before');

    transport.stream('before', Promise.resolve({ value: 1 }));
    transport.stream('after', Promise.resolve({ value: 2 }));
    await processTasks();
    await processTasks();
    page.executeScripts(chunks);

    await expect(requestedBefore).resolves.toEqual({ value: 1 });
    await expect(page.registry.get('after')).resolves.toEqual({ value: 2 });
  });

  it('rejects values without error details', async () => {
    const { transport, chunks, processTasks } = setup();
    const page = createPage();

    transport.stream('failed', Promise.reject(new Error('Not Found')));
    await processTasks();
    await processTasks();

    expect(chunks[0]).toBe(`<script>window.${STREAMING_REGISTRY_GLOBAL}.reject("failed")</script>`);

    page.executeScripts(chunks);

    await expect(page.registry.get('failed')).rejects.toThrow();
  });

  it('sends only safe error details in development mode', async () => {
    const env = process.env.NODE_ENV;
    const error = Object.assign(new Error('Not Found'), {
      status: 404,
      headers: { 'set-cookie': 'secret' },
    });

    process.env.NODE_ENV = 'development';

    try {
      const { transport, chunks, processTasks } = setup();
      const page = createPage();

      transport.stream('failed', Promise.reject(error));
      await processTasks();
      await processTasks();

      expect(chunks[0]).not.toContain('secret');
      expect(chunks[0]).not.toContain('at ');

      page.executeScripts(chunks);

      await expect(page.registry.get('failed')).rejects.toMatchObject({
        name: 'StreamedValueRejectedError',
        message: 'Streamed value is rejected at server-side: Not Found',
        status: 404,
      });
    } finally {
      process.env.NODE_ENV = env;
    }
  });

  it('does not send error details in production mode', async () => {
    const env = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';

    try {
      const { transport, chunks, processTasks } = setup();

      transport.stream('failed', Promise.reject(Object.assign(new Error('Not Found'), { status: 404 })));
      await processTasks();
      await processTasks();

      expect(chunks[0]).toBe(`<script>window.${STREAMING_REGISTRY_GLOBAL}.reject("failed")</script>`);
    } finally {
      process.env.NODE_ENV = env;
    }
  });

  it('escapes data inlined into scripts', async () => {
    const { transport, chunks, processTasks } = setup();
    const page = createPage();
    const data = { html: '</script><script>window.hacked = true</script>' };

    transport.stream('xss', Promise.resolve(data));
    await processTasks();
    await processTasks();

    expect(chunks[0]).not.toContain('</script><script>');

    page.executeScripts(chunks);

    expect(page.window.hacked).toBeUndefined();
    await expect(page.registry.get('xss')).resolves.toEqual(data);
  });

  it('buffers channel events until subscription, keeps the order', async () => {
    const { transport, chunks, processTasks } = setup();
    const page = createPage();
    const received: number[] = [];

    transport.emit('channel', 1);
    transport.emit('channel', 2);
    transport.emit('another-channel', 100);
    await processTasks();
    page.executeScripts(chunks);

    page.registry.subscribe('channel', (payload: number) => received.push(payload));

    expect(received).toEqual([1, 2]);

    transport.emit('channel', 3);
    await processTasks();
    page.executeScripts(chunks);

    expect(received).toEqual([1, 2, 3]);
  });

  it('does not push to destroyed stream', async () => {
    const { transport, chunks, processTasks, responseStream } = setup();

    responseStream.destroy();
    transport.stream('key', Promise.resolve('data'));
    await processTasks();
    await processTasks();

    expect(chunks).toHaveLength(0);
  });

  it('keeps response open until the promise is settled', async () => {
    const { transport, processTasks } = setup();
    let resolve: () => void = () => {};
    let closed = false;

    transport.stream(
      'key',
      new Promise<void>((res) => {
        resolve = res;
      })
    );
    processTasks().then(() => {
      closed = true;
    });
    await flush();

    expect(closed).toBe(false);

    resolve();
    await flush();

    expect(closed).toBe(true);
  });

  it('rejects unsettled values on abort', async () => {
    const { transport, chunks, processTasks } = setup();
    const page = createPage();

    transport.stream('settled', Promise.resolve('data'));
    transport.stream('unsettled', new Promise(() => {}));
    const closed = processTasks();

    transport.abort(new Error('timeout'));
    await closed;
    await processTasks();
    page.executeScripts(chunks);

    await expect(page.registry.get('settled')).resolves.toBe('data');
    await expect(page.registry.get('unsettled')).rejects.toThrow();
  });

  it('notifies when response is finished', async () => {
    const { transport, responseStream } = setup();
    const callback = jest.fn();

    transport.onFinish(callback);
    await flush();

    expect(callback).not.toHaveBeenCalled();

    responseStream.end();
    await flush();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
