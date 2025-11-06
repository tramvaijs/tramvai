import { Module } from 'node:module';
import path from 'node:path';

import { transform } from '@swc/core';

const requireFromString = (code: string, filename: string) => {
  // @ts-expect-error
  const newModule = new Module(filename, module.parent);

  newModule.filename = filename;
  newModule.paths = (Module as any)._nodeModulePaths(path.dirname(filename));
  (newModule as any)._compile(code, filename);

  return newModule.exports;
};

export function typescriptLoader() {
  return async (configPath: string, content: string) => {
    try {
      const { code } = await transform(content, {
        module: {
          type: 'commonjs',
        },
        jsc: {
          parser: {
            syntax: 'typescript',
          },
        },
      });
      const configModule = requireFromString(code, configPath);

      return configModule.default;
    } catch (error) {
      throw new Error(`Failed to read tramvai config! Details: ${error}`);
    }
  };
}
