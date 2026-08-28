import type { Compiler as WebpackCompiler } from 'webpack';
import type { Compiler as RspackCompiler } from '@rspack/core';

const PLUGIN_NAME = 'PatchAutoPublicPathPlugin';

type Compiler = WebpackCompiler | RspackCompiler;

export class PatchAutoPublicPathPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: any) => {
      compilation.hooks.runtimeModule.tap(PLUGIN_NAME, (module: any) => {
        const isAutoPublicPathModule =
          module.constructor?.name === 'AutoPublicPathRuntimeModule' ||
          module.constructorName === 'AutoPublicPathRuntimeModule' ||
          module.name === 'public_path';

        if (!isAutoPublicPathModule) {
          return;
        }

        // rspack
        if (module.source?.source != null) {
          const source = module.source.source.toString('utf-8');
          const patched = patchSource(source);

          module.source.source = Buffer.from(patched, 'utf-8');

          return;
        }

        // webpack
        if (typeof module.generate === 'function') {
          const generate = module.generate.bind(module);

          module.generate = (...args: unknown[]) => {
            const source = generate(...args);

            return typeof source === 'string' ? patchSource(source) : source;
          };
        }
      });
    });
  }
}

function patchSource(source: string): string {
  return source.replace(
    'document.currentScript.src',
    'document.currentScript.src || document.currentScript.dataset.src'
  );
}
