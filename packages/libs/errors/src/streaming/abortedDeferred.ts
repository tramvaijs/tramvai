export class AbortedDeferredError extends Error {
  static errorName = 'AbortedDeferredError';

  public isSilent: boolean;

  constructor({
    message = 'Deferred Action Abort',
    ...additionalFields
  }: {
    message?: string;
    [key: string]: any;
  } = {}) {
    super(message);
    this.name = AbortedDeferredError.errorName;
    this.isSilent = true;
    Object.assign(this, additionalFields);
  }
}

export const isAbortedDeferredError = (err: Error): err is AbortedDeferredError => {
  return err.name === AbortedDeferredError.errorName;
};
