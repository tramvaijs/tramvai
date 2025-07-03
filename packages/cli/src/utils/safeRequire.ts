import { sync as resolve } from 'resolve';
import path from 'node:path';
import { extensions } from '../config/constants';

export const safeRequire = (path: string, silent?: boolean) => {
  try {
    return require(path);
  } catch (error) {
    if (!silent) {
      // TODO: replace with logger from di
      console.error(`Require for path ${path} failed`, error);
    }
  }
};

export const safeRequireResolve = (targetPath: string, basedir: string, silent?: boolean) => {
  try {
    return resolve(targetPath, {
      extensions,
      basedir,
    });
  } catch (error) {
    try {
      return resolve(path.resolve(basedir, targetPath), {
        extensions,
        basedir,
      });
    } catch (_e) {}

    if (!silent) {
      // TODO: replace with logger from di
      console.error(`Require for path ${targetPath} failed`, error);
    }

    return '';
  }
};
