import path from 'node:path';
import type { WebpackPluginInstance, Compiler } from 'webpack';
import { NormalModule } from 'webpack';

// TODO: migrate to new webpack virtual plugin - https://github.com/webpack/webpack/pull/19508
/**
 * Plugin to resolve imports with `virtual:*` protocol
 * Naming conventions inspired by https://vite.dev/guide/api-plugin#virtual-modules-convention
 * Used webpack uri's plugins as references - node_modules/webpack/lib/schemes/*
 */
export class VirtualProtocolPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('VirtualProtocolPlugin', (compilation) => {
      const hooks = NormalModule.getCompilationHooks(compilation);

      hooks.readResource
        .for('virtual')
        .tapAsync('VirtualProtocolPlugin', (loaderContext: any, callback) => {
          const { resourcePath } = loaderContext;
          // https://github.com/sysgears/webpack-virtual-modules/blob/35a2341f92b80f2b7aedafc58eafa2e358d7e09c/src/index.ts#L19
          const filePath = path.join(compiler.context, resourcePath);

          // we need to add this virtual file to watched files list
          loaderContext.addDependency(filePath);
          // also, to prevent immediate rebuild after initial compilation, mark file as missing
          loaderContext.addMissingDependency(filePath);

          // TODO: processing as JS/TS source code?
          loaderContext.fs.readFile(filePath, callback);
        });
    });
  }
}
