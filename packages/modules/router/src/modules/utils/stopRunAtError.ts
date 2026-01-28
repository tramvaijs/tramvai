import { isNotFoundError, isRedirectFoundError } from '@tinkoff/errors';

export const stopRunAtError = (error: Error) => {
  if (isNotFoundError(error) || isRedirectFoundError(error)) {
    return true;
  }

  return false;
};
