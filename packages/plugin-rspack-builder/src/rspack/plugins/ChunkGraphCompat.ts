import { Compiler, Chunk } from '@rspack/core';
import { Template } from '@rspack/core';

// Add missing API methods in rspack compiler/hooks/template
// this API used in UniversalFederationPlugin
export class PatchChunkGraphPlugin {
  apply(compiler: Compiler) {
    // Patch additionalTreeRuntimeRequirements hook in rspack
    // webpack has 3 arguments (chunk, runtimeRequirements, RuntimeRequirementsContext)
    // when rspack has only 2, add RuntimeRequirementsContext argument manually
    compiler.hooks.thisCompilation.tap('WebpackRuntimeRequirementsCompatPlugin', (compilation) => {
      const hook = compilation.hooks.additionalTreeRuntimeRequirements;

      hook.intercept({
        register(tap) {
          if (tap.name !== 'StartupChunkDependenciesPlugin') {
            return tap;
          }

          const originalFn = tap.fn;

          return {
            ...tap,
            fn(chunk: Chunk, runtimeRequirements: Set<string>) {
              return originalFn(chunk, runtimeRequirements, {
                chunkGraph: compilation.chunkGraph,
                codeGenerationResults: compilation.codeGenerationResults,
              });
            },
          };
        },
      });
    });

    // Add missing in rspack runtimeTemplate functions
    compiler.hooks.thisCompilation.tap('RspackWebpackCompatPlugin', (compilation) => {
      const compatCompilation = compilation;

      // @ts-expect-error new compilation field
      compatCompilation.runtimeTemplate ??= {};
      // @ts-expect-error
      const { runtimeTemplate } = compatCompilation;

      // https://github.com/webpack/webpack/blob/main/lib/RuntimeTemplate.js#L1358
      runtimeTemplate.basicFunction ??= (args: string, body: string | string[]) => {
        return `function(${args}) {\n${Template.indent(body)}\n}`;
      };

      // https://github.com/webpack/webpack/blob/main/lib/RuntimeTemplate.js#L1346
      runtimeTemplate.returningFunction ??= (returnValue: string, args = '') => {
        return `function(${args}) { return ${returnValue}; }`;
      };
    });

    // Add in rspack missing functino chunkGraph.getChunkConditionMap implementation
    compiler.hooks.thisCompilation.tap('PatchChunkGraphPlugin', (compilation) => {
      compilation.hooks.runtimeModule.tap('PatchChunkGraphPlugin', (runtimeModule) => {
        // @ts-expect-error use protected field
        const { chunkGraph } = runtimeModule;

        if (!chunkGraph || 'getChunkConditionMap' in chunkGraph) {
          return;
        }

        // @ts-expect-error implement missing in rspack method
        chunkGraph.getChunkConditionMap = function (
          chunk: Chunk,
          filterFn: (chunk: Chunk, _chunkGraph: any) => boolean
        ) {
          const map = Object.create(null);
          const queue = new Set(chunk.groupsIterable);

          for (const chunkGroup of queue) {
            for (const referencedChunk of chunkGroup.chunks) {
              if (referencedChunk.id !== null) {
                map[referencedChunk.id!] = filterFn(referencedChunk, this);
              }
            }

            for (const childGroup of chunkGroup.childrenIterable) {
              queue.add(childGroup);
            }
          }

          return map;
        };
      });
    });
  }
}
