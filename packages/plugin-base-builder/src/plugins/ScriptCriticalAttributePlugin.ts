import type webpack from 'webpack';
import type { Compiler } from '@rspack/core';

const PLUGIN_NAME = 'ScriptCriticalAttributePlugin';

const addDataCritical = (source: string) =>
  `${source}\nscript.setAttribute("data-critical", "true");`;

/**
 * Marks every script tag that the bundler's chunk-loading runtime creates with
 * `data-critical="true"` — set during element construction, before the tag is
 * appended to `document.head`, so retry-assets can identify dynamically-loaded
 * chunks without relying on the bundler-specific `data-webpack` / `data-rspack`
 * attribute.
 *
 * Supports both webpack (via `LoadScriptRuntimeModule.getCompilationHooks().createScript`)
 * and rspack (via `RuntimePlugin.getCompilationHooks().createScript`). Detection is
 * done at compilation time: webpack's hook throws a TypeError when passed an rspack
 * Compilation (instanceof check), so the catch branch handles the rspack path.
 */
export class ScriptCriticalAttributePlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler | Compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if ('rspack' in compiler) {
        // rspack: equivalent hook on RuntimePlugin — same SyncWaterfallHook interface.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { RuntimePlugin } = require('@rspack/core');

        RuntimePlugin.getCompilationHooks(compilation).createScript.tap(
          PLUGIN_NAME,
          addDataCritical
        );
      } else {
        // webpack: SyncWaterfallHook inside LoadScriptRuntimeModule — fires during the
        // `if (!script)` block of __webpack_require__.l, before head.appendChild.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createScript } =
          require('webpack/lib/runtime/LoadScriptRuntimeModule').getCompilationHooks(compilation);

        createScript.tap(PLUGIN_NAME, addDataCritical);
      }
    });
  }
}
