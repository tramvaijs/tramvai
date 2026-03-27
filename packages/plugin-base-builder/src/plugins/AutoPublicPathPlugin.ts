import { Compiler } from 'webpack';

// Fixes webpack AutoPublicPathPlugin error when fallback load of shared microfrontend chunk
// this happens because currentScript.src is not defined for an inline script
export class PatchAutoPublicPathPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('PatchAutoPublicPathPlugin', (compilation) => {
      compilation.hooks.runtimeModule.tap('PatchAutoPublicPathPlugin', (module) => {
        if (module.constructor.name === 'AutoPublicPathRuntimeModule') {
          const base = module.generate.bind(module);

          // eslint-disable-next-line no-param-reassign
          module.generate = function (...args) {
            const result = base(...args);

            return result!.replace(
              'document.currentScript.src',
              'document.currentScript.src || document.currentScript.dataset.src'
            );
          };
        }
      });
    });
  }
}
