import { sync as resolve } from 'resolve';
import { extensions } from '../config';
import { logger } from '../services/logger';

export const safeRequire = (path: string, silent?: boolean) => {
  try {
    return require(path);
  } catch (error) {
    if (!silent) {
      logger.event({
        type: 'error',
        event: 'safe-require-error',
        message: `Require for path ${path} failed`,
        payload: { error },
      });
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
      logger.event({
        type: 'error',
        event: 'safe-require-resolve-error',
        message: `Require for path ${path} failed`,
        payload: { error },
      });
    }

    return '';
  }
};
