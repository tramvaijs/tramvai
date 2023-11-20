import noop from '@tinkoff/utils/function/noop';

export class Deferred<T> {
  status: 'pending' | 'resolved' | 'rejected' = 'pending';

  promise: Promise<T>;

  resolve: (value: T) => void = noop;

  reject: (reason?: unknown) => void = noop;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        if (this.status === 'pending') {
          this.status = 'resolved';
          resolve(value);
        }
      };

      this.reject = (reason) => {
        if (this.status === 'pending') {
          this.status = 'rejected';
          reject(reason);
        }
      };
    });
  }
}
