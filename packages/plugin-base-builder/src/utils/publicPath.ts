import path from 'node:path';

/**
 * `dist/server` -> `/dist/server/`
 */
export const resolvePublicPathDirectory = (publicPath: string): string => {
  return path.posix.join('/', publicPath, '/');
};
