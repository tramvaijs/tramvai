export class Deferred<T> {
  promise: Promise<T>;
  status: 'pending' | 'resolved' | 'rejected' = 'pending';
  resolve: (value: T) => void = () => {};
  reject: (reason: Error) => void = () => {};

  resolveData: unknown;
  rejectReason: Error | undefined;

  isResolved = () => {
    return typeof this.resolveData !== 'undefined';
  };

  isRejected = () => {
    return typeof this.rejectReason !== 'undefined';
  };

  reset = () => {
    this.status = 'pending';
    this.resolveData = undefined;
    this.rejectReason = undefined;
    this.promise = this.initPromise();
  };

  private initPromise = (): Promise<T> => {
    return new Promise((resolve, reject) => {
      this.resolve = (value) => {
        if (this.status === 'pending') {
          this.resolveData = value;
          this.status = 'resolved';
          resolve(value);
        }
      };

      this.reject = (reason: Error) => {
        if (this.status === 'pending') {
          this.rejectReason = reason;
          this.status = 'rejected';
          reject(reason);
        }
      };
    });
  };

  constructor() {
    this.promise = this.initPromise();
  }
}
