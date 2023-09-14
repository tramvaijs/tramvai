import type { Deferred } from '@tramvai/tokens-common';

export function __Deferred(this: Deferred & Record<string, any>) {
  this.initPromise = () => {
    return new Promise((resolve, reject) => {
      this.resolve = (value) => {
        this.resolveData = value;
        resolve(value);
      };

      this.reject = (reason) => {
        this.rejectReason = reason;
        reject(reason);
      };
    });
  };

  this.promise = this.initPromise();

  this.isResolved = () => {
    return typeof this.resolveData !== 'undefined';
  };

  this.isRejected = () => {
    return typeof this.rejectReason !== 'undefined';
  };

  this.reset = () => {
    this.resolveData = undefined;
    this.rejectReason = undefined;
    this.promise = this.initPromise();
  };
}
