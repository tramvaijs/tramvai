import { RuntimeModule, RuntimeGlobals } from 'webpack';
import type webpack from 'webpack';
import type { Compiler } from 'webpack';

const PLUGIN_NAME = 'RuntimePathPlugin';

interface Options {
  publicPath: string;
}

/**
 * RuntimePathPlugin необходим для правильной генерации ссылок на ассеты (картинки и т.п. которые грузятся через file-loader или url-loader)
 */
export class RuntimePathPlugin implements webpack.WebpackPluginInstance {
  protected options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const publicPathEval = this.options.publicPath;
    const compilerPublicPath = compiler.options.output.publicPath ?? '';
    const defaultPublicPath =
      compilerPublicPath === 'auto' ? compilerPublicPath : `"${compilerPublicPath}"`;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.publicPath)
        .tap(PLUGIN_NAME, (chunk) => {
          // set custom public path only to entries and webpack runtime as this way public path will be constructed in runtime
          // some of the webpack plugins may use [importModule](https://webpack.js.org/api/loaders/#thisimportmodule) that allows execute modules at build time
          // for example mini-css-extract-plugin uses this method that leads to error `window is not defined` at build if we don't
          // prevent adding dynamic code to every chunk altogether
          const chunkName = chunk.name!.toString();
          const isEntry = compilation.entries.has(chunkName);
          // webpack runtime chunk with runtimeChunk: 'single' option
          const isWebpackRuntime = chunkName === 'runtime';

          const needToPatchRuntime = isEntry || isWebpackRuntime;

          compilation.addRuntimeModule(
            chunk,
            new (class extends RuntimeModule {
              generate() {
                // setting dynamic publicPath
                return `${RuntimeGlobals.publicPath} = ${
                  needToPatchRuntime ? publicPathEval : defaultPublicPath
                };`;
              }
            } as any)('runtime-path-module')
          );

          // вернуть true чтобы не вызывалась логика по умолчанию
          return true;
        });
    });
  }
}
