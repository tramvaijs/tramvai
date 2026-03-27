import path from 'path';
import { Compiler } from 'webpack';

import { nodeModules, NEXT } from './consts';

import { removeAfter, removeBefore, hasValue, firstMatch } from '.';

export const parseRequest = (requestStr: string) => {
  const parts = (requestStr || '').split('!');

  const file = path.relative(
    process.cwd(),
    // @ts-expect-error
    removeAfter('?', removeBefore(nodeModules, parts.pop()))
  );

  const loaders = parts.map((part) => firstMatch(/[a-z0-9-@]+-loader/, part)).filter(hasValue);

  return {
    file: hasValue(file) ? file : null,
    loaders,
  };
};

export const formatRequest = (request: any) => {
  const loaders = request.loaders.join(NEXT);

  if (!loaders.length) {
    return request.file || '';
  }

  return `${loaders}${NEXT}${request.file}`;
};

// Hook helper for webpack 3 + 4 support
export function hook(compiler: Compiler, hookName: any, fn: any) {
  if (compiler.hooks) {
    // @ts-expect-error
    compiler.hooks[hookName].tap(`WebpackBar:${hookName}`, fn);
  } else {
    // @ts-expect-error
    compiler.plugin(hookName, fn);
  }
}
