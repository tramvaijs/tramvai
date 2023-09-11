import type { Deferred } from '@tramvai/tokens-common';

export function __Deferred(this: Deferred) {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = (value) => {
      this.resolveData = value;
      resolve(value);
    };

    this.reject = (reason) => {
      this.rejectReason = reason;
      reject(reason);
    };
  });

  this.isResolved = () => {
    return typeof this.resolveData !== 'undefined';
  };

  this.isRejected = () => {
    return typeof this.rejectReason !== 'undefined';
  };
}
