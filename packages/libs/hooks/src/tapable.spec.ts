import { TapableHooks } from './tapable';

describe('libs/hooks/tapable', () => {
  it('sync hook and plugin', () => {
    const factory = new TapableHooks();

    const hook = factory.createSync<number, number>('test');

    hook.tap('test', (context, payload, result) => payload + 1);

    const result = hook.call(1);

    expect(result).toBe(2);
  });

  it('plugin untap callback', () => {
    const factory = new TapableHooks();

    const hook = factory.createSync<number, number>('test');

    const untap = hook.tap('test', (context, payload, result) => payload + 1);

    let result = hook.call(1);

    expect(result).toBe(2);

    untap();

    result = hook.call(1);

    expect(result).toBe(undefined);
  });

  it('async hook and sync plugin', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<number, number>('test');

    hook.tap('test', (context, payload, result) => payload + 1);

    const result = await hook.callPromise(1);

    expect(result).toBe(2);
  });

  it('async hook and promise plugin', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<number, number>('test');

    hook.tapPromise('test', async (context, payload, result) => payload + 1);

    const result = await hook.callPromise(1);

    expect(result).toBe(2);
  });

  it('async hook and async plugin', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<number, number>('test');

    hook.tapAsync('test', (context, payload, result, done) => {
      done(undefined, payload + 1);
    });

    const result = await hook.callPromise(1);

    expect(result).toBe(2);
  });

  it('async hook and mix plugins payload', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<number, number>('test');

    hook.tap('test-1', (context, payload, result) => payload + 1);
    hook.tapPromise('test-2', async (context, payload, result) => result + 1);
    hook.tapAsync('test-3', (context, payload, result, done) => {
      done(undefined, result + 1);
    });

    const result = await hook.callPromise(1);

    expect(result).toBe(4);
  });

  it('async hook and mix plugins order', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<string, string>('test');

    hook.tap('test-1', (context, payload, result) => `${payload}2`);
    hook.tapPromise('test-2', async (context, payload, result) => `${result}3`);
    hook.tapAsync('test-3', (context, payload, result, done) => {
      done(undefined, `${result}4`);
    });

    const result = await hook.callPromise('1');

    expect(result).toBe('1234');
  });

  it('parallel hook and mix plugins', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsyncParallel<string[]>('test');

    hook.tapPromise('test-1', async (context, payload) => {
      payload.push('p1');
    });
    hook.tapAsync('test-2', (context, payload, result, done) => {
      payload.push('p2');
      done(undefined);
    });
    hook.tapPromise('test-3', async (context, payload) => {
      payload.push('p3');
    });
    hook.tapAsync('test-4', (context, payload, result, done) => {
      payload.push('p4');
      done(undefined);
    });
    hook.tap('test-5', (context, payload) => {
      payload.push('p5');
    });

    const list: string[] = [];

    await hook.callPromise(list);

    expect(list).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
  });

  it('wrap sync hook and sync plugin', () => {
    const factory = new TapableHooks();
    const hook = factory.createSync<number, number>('test');
    let pre: number = 0;
    let post: number = 0;

    hook.tap('test', (context, payload, result) => payload + 1);

    hook.wrap((context, payload, next) => {
      pre = payload;
      const r = next(payload);
      post = r;
      return r;
    });

    const result = hook.call(1);

    expect(result).toBe(2);
    expect(pre).toBe(1);
    expect(post).toBe(2);
  });

  it('multiple wrap order sync hook', () => {
    const factory = new TapableHooks();
    const hook = factory.createSync<string, string>('test');

    hook.tap('test', (context, payload, result) => `${payload}3`);

    hook.wrap((context, payload, next) => {
      return `2${next(`-w1${payload}w1-`)}4`;
    });

    hook.wrap((context, payload, next) => {
      return `1${next(`-w2${payload}w2-`)}5`;
    });

    const result = hook.call('-payload-');

    expect(result).toBe('12-w1-w2-payload-w2-w1-345');
  });

  it('wrap async hook and promise plugin', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<number, number>('test');
    let pre: number = 0;
    let post: number = 0;

    hook.tap('test', (context, payload) => payload + 1);

    hook.wrap(async (context, payload, next) => {
      pre = payload;
      const r = await next(payload);
      post = r;
      return r;
    });

    const result = await hook.callPromise(1);

    expect(result).toBe(2);
    expect(pre).toBe(1);
    expect(post).toBe(2);
  });

  it('wrap parallel hook and mix plugin', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsyncParallel<number[]>('test');
    let pre: string = '';
    let post: string = '';

    hook.tap('test-1', (context, payload, result) => {
      payload.push(1);
    });
    hook.tapPromise('test-2', async (context, payload, result) => {
      payload.push(2);
    });
    hook.tapAsync('test-3', (context, payload, result, done) => {
      payload.push(3);
      done(undefined);
    });

    hook.wrap(async (context, payload, next) => {
      pre = payload.toString();
      await next(payload);
      post = payload.toString();
    });

    const list: number[] = [];

    await hook.callPromise(list);

    expect(list).toEqual([1, 2, 3]);
    expect(pre).toBe('');
    expect(post).toBe('1,2,3');
  });

  it('multiple wrap order async hook', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsync<string, string>('test');

    hook.tapPromise('test', async (context, payload, result) => {
      return `${payload}3`;
    });

    hook.wrap(async (context, payload, next) => {
      return `2${await next(`-w1${payload}w1-`)}4`;
    });

    hook.wrap(async (context, payload, next) => {
      return `1${await next(`-w2${payload}w2-`)}5`;
    });

    const result = await hook.callPromise('-payload-');

    expect(result).toBe('12-w1-w2-payload-w2-w1-345');
  });

  it('multiple wrap order parallel hook', async () => {
    const factory = new TapableHooks();
    const hook = factory.createAsyncParallel<number[]>('test');
    let pre1: string = '';
    let post1: string = '';
    let pre2: string = '';
    let post2: string = '';

    hook.tapPromise('test', async (context, payload, result) => {
      payload.push(3);
    });

    hook.wrap(async (context, payload, next) => {
      pre1 = payload.toString();
      payload.push(2);
      await next(payload);
      payload.push(4);
      post1 = payload.toString();
    });

    hook.wrap(async (context, payload, next) => {
      pre2 = payload.toString();
      payload.push(1);
      await next(payload);
      payload.push(5);
      post2 = payload.toString();
    });

    const list: number[] = [];

    await hook.callPromise(list);

    expect(list).toEqual([1, 2, 3, 4, 5]);
    expect(pre1).toBe('1');
    expect(post1).toBe('1,2,3,4');
    expect(pre2).toBe('');
    expect(post2).toBe('1,2,3,4,5');
  });
});
