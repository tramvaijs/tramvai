/* eslint-disable @typescript-eslint/no-shadow */
import type {
  AsyncFn,
  AsyncParallelTapableHookInstance,
  AsyncTapableHookInstance,
  AsyncTapablePlugin,
  AsyncWrapper,
  PromiseTapablePlugin,
  SyncTapableHookInstance,
  SyncTapablePlugin,
  SyncWrapper,
  TapableFactory,
} from './types';

export { SyncTapableHookInstance, AsyncTapableHookInstance, AsyncParallelTapableHookInstance };

export class SyncTapable<Payload, Result, Context = {}>
  implements SyncTapableHookInstance<Payload, Result, Context>
{
  private name: string;
  private plugins: Set<SyncTapablePlugin<Payload, Result, Context>> = new Set();
  private wrappers: Set<SyncWrapper<Payload, Result, Context>> = new Set();

  constructor(name: string) {
    this.name = name;
  }

  tap(name: string, fn: (context: Context, payload: Payload, result: Result) => Result) {
    const plugin: SyncTapablePlugin<Payload, Result, Context> = {
      name,
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  call(payload: Payload): Result {
    const wrappers = Array.from(this.wrappers).reverse();
    const plugins = Array.from(this.plugins.values());
    const context = {} as Context;
    let result: Result;
    let index = -1;

    const next = (payload: Payload): Result => {
      index++;

      if (index < wrappers.length) {
        const wrapper = wrappers[index];
        return wrapper(context, payload, next);
      }

      if (index === wrappers.length) {
        for (const plugin of plugins) {
          // eslint-disable-next-line no-param-reassign
          result = plugin.fn(context, payload, result);
        }
      }

      return result;
    };

    return next(payload);
  }

  wrap(fn: SyncWrapper<Payload, Result, Context>) {
    this.wrappers.add(fn);
  }
}

export class AsyncTapable<Payload, Result, Context = {}>
  implements AsyncTapableHookInstance<Payload, Result, Context>
{
  private name: string;
  private plugins: Set<
    | SyncTapablePlugin<Payload, Result, Context>
    | PromiseTapablePlugin<Payload, Result, Context>
    | AsyncTapablePlugin<Payload, Result, Context>
  > = new Set();

  private wrappers: Set<AsyncWrapper<Payload, Result, Context>> = new Set();

  constructor(name: string) {
    this.name = name;
  }

  tap(name: string, fn: (context: Context, payload: Payload, result: Result) => Result) {
    const plugin: SyncTapablePlugin<Payload, Result, Context> = {
      name,
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  tapPromise(
    name: string,
    fn: (context: Context, payload: Payload, result: Result) => Promise<Result>
  ) {
    const plugin: PromiseTapablePlugin<Payload, Result, Context> = {
      name,
      options: { type: 'promise' },
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  tapAsync(
    name: string,
    fn: (
      context: Context,
      payload: Payload,
      result: Result,
      next: AsyncFn<Payload, Result, Context>
    ) => void
  ) {
    const plugin: AsyncTapablePlugin<Payload, Result, Context> = {
      name,
      options: { type: 'async' },
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  callPromise(payload: Payload): Promise<Result> {
    const wrappers = Array.from(this.wrappers).reverse();
    const plugins = Array.from(this.plugins.values());
    const context = {} as Context;
    let result: Result;
    let index = -1;

    const next = async (payload: Payload): Promise<Result> => {
      index++;

      if (index < wrappers.length) {
        const wrapper = wrappers[index];
        return wrapper(context, payload, next);
      }

      if (index === wrappers.length) {
        for (const plugin of plugins) {
          if ('options' in plugin) {
            if (plugin.options.type === 'promise') {
              // eslint-disable-next-line no-param-reassign
              result = await (plugin as PromiseTapablePlugin<Payload, Result, Context>).fn(
                context,
                payload,
                result
              );
            } else if (plugin.options.type === 'async') {
              // eslint-disable-next-line no-param-reassign, no-loop-func
              result = await new Promise((resolve, reject) => {
                (plugin as AsyncTapablePlugin<Payload, Result, Context>).fn(
                  context,
                  payload,
                  result,
                  (error, nextResult) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(nextResult);
                    }
                  }
                );
              });
            }
          } else {
            // eslint-disable-next-line no-param-reassign
            result = (plugin as SyncTapablePlugin<Payload, Result, Context>).fn(
              context,
              payload,
              result
            );
          }
        }
      }

      return result;
    };

    return next(payload);
  }

  wrap(fn: AsyncWrapper<Payload, Result, Context>) {
    this.wrappers.add(fn);
  }
}

export class AsyncParallelTapable<Payload, Context = {}>
  implements AsyncParallelTapableHookInstance<Payload, Context>
{
  private name: string;
  private plugins: Set<
    | SyncTapablePlugin<Payload, void, Context>
    | PromiseTapablePlugin<Payload, void, Context>
    | AsyncTapablePlugin<Payload, void, Context>
  > = new Set();

  private wrappers: Set<AsyncWrapper<Payload, void, Context>> = new Set();

  constructor(name: string) {
    this.name = name;
  }

  tap(name: string, fn: (context: Context, payload: Payload, result: void) => void) {
    const plugin: SyncTapablePlugin<Payload, void, Context> = {
      name,
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  tapPromise(
    name: string,
    fn: (context: Context, payload: Payload, result: void) => Promise<void>
  ) {
    const plugin: PromiseTapablePlugin<Payload, void, Context> = {
      name,
      options: { type: 'promise' },
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  tapAsync(
    name: string,
    fn: (
      context: Context,
      payload: Payload,
      result: void,
      next: AsyncFn<Payload, void, Context>
    ) => void
  ) {
    const plugin: AsyncTapablePlugin<Payload, void, Context> = {
      name,
      options: { type: 'async' },
      fn,
    };

    this.plugins.add(plugin);

    return () => {
      this.plugins.delete(plugin);
    };
  }

  callPromise(payload: Payload): Promise<void> {
    const wrappers = Array.from(this.wrappers).reverse();
    const plugins = Array.from(this.plugins.values());
    const context = {} as Context;
    let index = -1;

    const next = async (payload: Payload): Promise<void> => {
      index++;

      if (index < wrappers.length) {
        const wrapper = wrappers[index];
        return wrapper(context, payload, next);
      }

      if (index === wrappers.length) {
        await Promise.all(
          plugins.map((plugin) => {
            if ('options' in plugin) {
              if (plugin.options.type === 'promise') {
                return (plugin as PromiseTapablePlugin<Payload, void, Context>).fn(
                  context,
                  payload
                );
              }
              if (plugin.options.type === 'async') {
                return new Promise((resolve, reject) => {
                  (plugin as AsyncTapablePlugin<Payload, void, Context>).fn(
                    context,
                    payload,
                    undefined,
                    (error, nextResult) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(nextResult);
                      }
                    }
                  );
                });
              }
            }
            return (plugin as SyncTapablePlugin<Payload, void, Context>).fn(context, payload);
          })
        );
      }
    };

    return next(payload);
  }

  wrap(fn: AsyncWrapper<Payload, void, Context>) {
    this.wrappers.add(fn);
  }
}

export class TapableHooks implements TapableFactory {
  createSync<Payload, Result = void, Context = {}>(
    name: string
  ): SyncTapableHookInstance<Payload, Result, Context> {
    return new SyncTapable<Payload, Result, Context>(name);
  }

  createAsync<Payload, Result = void, Context = {}>(
    name: string
  ): AsyncTapableHookInstance<Payload, Result, Context> {
    return new AsyncTapable<Payload, Result, Context>(name);
  }

  createAsyncParallel<Payload, Context = {}>(
    name: string
  ): AsyncParallelTapableHookInstance<Payload, Context> {
    return new AsyncParallelTapable(name);
  }
}
/* eslint-enable @typescript-eslint/no-shadow */
