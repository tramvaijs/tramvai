import { sync as resolve } from 'resolve';
import { extensions } from '../config';

export const safeRequire = (path: string, silent?: boolean) => {
  try {
    return require(path);
  } catch (error) {
    if (!silent) {
      // TODO: replace with logger from di?
      // eslint-disable-next-line no-console
      console.error(`Require for path ${path} failed`, error);
    }
  }
};

export const safeRequireResolve = (path: string, silent?: boolean) => {
  try {
    return resolve(path, {
      extensions,
    });
  } catch (error) {
    if (!silent) {
      // TODO: replace with logger from di?
      // eslint-disable-next-line no-console
      console.error(`Require for path ${path} failed`, error);
    }

    return '';
  }
};
