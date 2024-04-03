import type { Deferred as IDeferred } from '@tramvai/tokens-common';

export class Deferred implements IDeferred {
  promise: Promise<any>;
  resolve!: (value: any) => void;
  reject!: (reason: any) => void;

  resolveData: any;
  rejectReason: any;

  isResolved = () => {
    return typeof this.resolveData !== 'undefined';
  };

  isRejected = () => {
    return typeof this.rejectReason !== 'undefined';
  };

  reset = () => {
    this.resolveData = undefined;
    this.rejectReason = undefined;
    this.promise = this.initPromise();
  };

  private initPromise = () => {
    return new Promise((resolve, reject) => {
      this.resolve = (value: any) => {
        this.resolveData = value;
        resolve(value);
      };
      this.reject = (reason: any) => {
        this.rejectReason = reason;
        reject(reason);
      };
    });
  };

  constructor() {
    this.promise = this.initPromise();
  }
}
