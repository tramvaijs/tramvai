export type UntapCallback = () => void;
export type SyncTapablePlugin<Payload, Result, Context> = {
  name: string;
  fn: (context: Context, payload: Payload, result: Result) => Result;
};
export type PromiseTapablePlugin<Payload, Result, Context> = {
  name: string;
  options: { type: 'promise' };
  fn: (context: Context, payload: Payload, result: Result) => Promise<Result>;
};
export type AsyncFn<Payload, Result, Context> = (error: Error | undefined, result: Result) => void;
export type AsyncTapablePlugin<Payload, Result, Context> = {
  name: string;
  options: { type: 'async' };
  fn: (
    context: Context,
    payload: Payload,
    result: Result,
    done: AsyncFn<Payload, Result, Context>
  ) => void;
};

export type SyncWrapper<Payload, Result, Context> = (
  context: Context,
  payload: Payload,
  next: (payload: Payload) => Result
) => Result;
export type SyncTapableHookInstance<Payload, Result = void, Context = {}> = {
  tap(
    name: string,
    fn: (context: Context, payload: Payload, result: Result) => Result
  ): UntapCallback;
  call(payload: Payload): Result;
  wrap(fn: SyncWrapper<Payload, Result, Context>): void;
};
export type AsyncWrapper<Payload, Result, Context> = (
  context: Context,
  payload: Payload,
  next: (payload: Payload) => Promise<Result>
) => Promise<Result>;
export type AsyncTapableHookInstance<Payload, Result = void, Context = {}> = {
  tapAsync(
    name: string,
    fn: (
      context: Context,
      payload: Payload,
      result: Result,
      done: AsyncFn<Payload, Result, Context>
    ) => void
  ): UntapCallback;
  tapPromise(
    name: string,
    fn: (context: Context, payload: Payload, result: Result) => Promise<Result>
  ): UntapCallback;
  tap(
    name: string,
    fn: (context: Context, payload: Payload, result: Result) => Result
  ): UntapCallback;
  callPromise(payload: Payload): Promise<Result>;
  wrap(fn: AsyncWrapper<Payload, Result, Context>): void;
};
export type AsyncParallelTapableHookInstance<Payload, Context = {}> = {
  tapAsync(
    name: string,
    fn: (
      context: Context,
      payload: Payload,
      result: void,
      done: AsyncFn<Payload, void, Context>
    ) => void
  ): UntapCallback;
  tapPromise(
    name: string,
    fn: (context: Context, payload: Payload, result: void) => Promise<void>
  ): UntapCallback;
  tap(name: string, fn: (context: Context, payload: Payload, result: void) => void): UntapCallback;
  callPromise(payload: Payload): Promise<void>;
  wrap(fn: AsyncWrapper<Payload, void, Context>): void;
};

export type TapableFactory = {
  createSync<Payload, Result, Context>(
    name: string
  ): SyncTapableHookInstance<Payload, Result, Context>;
  createAsync<Payload, Result, Context>(
    name: string
  ): AsyncTapableHookInstance<Payload, Result, Context>;
  createAsyncParallel<Payload, Context>(
    name: string
  ): AsyncParallelTapableHookInstance<Payload, Context>;
};
