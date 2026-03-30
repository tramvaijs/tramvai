import type { Compiler, MultiCompiler } from '@rspack/core';
import type { Compiler as WebpackCompiler, MultiCompiler as WebpackMultiCompiler } from 'webpack';

type AnyCompiler = WebpackCompiler | Compiler;

export function calculateBuildTime(compiler: AnyCompiler): any {
  let startTime = Date.now();
  let timeDiff: number;

  compiler.hooks.invalid.tap('calculateBuildTime', () => {
    startTime = Date.now();
  });
  compiler.hooks.done.tap('calculateBuildTime', () => {
    timeDiff = Date.now() - startTime;
  });

  return () => {
    return timeDiff;
  };
}
