export class AbortedStreamError extends Error {
  static errorName = 'AbortedStreamError';

  constructor({
    message = 'Response Stream Abort',
    ...additionalFields
  }: {
    message?: string;
    [key: string]: any;
  } = {}) {
    super(message);
    this.name = AbortedStreamError.errorName;
    Object.assign(this, additionalFields);
  }
}

export const isAbortedStreamError = (err: Error): err is AbortedStreamError => {
  return err.name === AbortedStreamError.errorName;
};
