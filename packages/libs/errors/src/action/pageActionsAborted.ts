export class PageActionsAbortError extends Error {
  static errorName = 'PageActionsAbortError';
  contextName?: string;

  constructor({
    message = 'Page actions were aborted',
    ...additionalFields
  }: {
    message?: string;
    [key: string]: any;
  } = {}) {
    super(message);
    this.name = PageActionsAbortError.errorName;
    Object.assign(this, additionalFields);
  }
}

export const isPageActionsAbortError = (err: Error): err is PageActionsAbortError => {
  return err.name === PageActionsAbortError.errorName;
};
