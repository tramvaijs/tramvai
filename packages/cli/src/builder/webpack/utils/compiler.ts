import type { DI_TOKEN } from '@tinkoff/dippy';
import type { Configuration } from 'webpack';
import { webpack, type Compiler } from 'webpack';

// reuse input file system between compilers for faster builds, reference - https://github.com/vercel/next.js/pull/51879
export const createCompiler = (config: Configuration, di: typeof DI_TOKEN): Compiler => {
  const compiler = webpack(config);
  const inputFileSystem: Compiler['inputFileSystem'] | null = di.get({
    token: 'webpack inputFileSystem',
    optional: true,
  }) as any;

  if (inputFileSystem) {
    // eslint-disable-next-line no-param-reassign
    compiler.inputFileSystem = inputFileSystem;
  } else {
    di.register({
      provide: 'webpack inputFileSystem',
      useValue: compiler.inputFileSystem,
    });
  }

  return compiler;
};
