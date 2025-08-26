import { ScriptTarget } from 'typescript';
import type { Build, BuildParams } from './build.h';
import { createInputOptions, createOutputOptions } from './common';
import { getSourceFilename } from '../fileNames.ts';

const buildFileName = (params: BuildParams) => {
  const mainFileName = params.packageJSON.main;

  return mainFileName;
};

export const build: Build = {
  name: 'node:cjs',
  cacheName: 'node',
  async shouldExecute({ packageJSON }) {
    return Boolean(packageJSON.main);
  },
  async getOptions(params) {
    const input = createInputOptions(params, {
      entry: getSourceFilename(params),
      // Node.js 16+ support - https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping#node-18
      target: ScriptTarget.ES2022,
    });
    const output = createOutputOptions(params, {
      file: buildFileName(params),
      format: 'cjs',
      exportsField: 'named',
      postfix: '.js',
    });

    return {
      input,
      output,
    };
  },
  async modifyPackageJSON(params) {
    const nextPackageJson = {
      ...params.packageJSON,
      main: buildFileName(params),
    };

    delete nextPackageJson.es2017;

    return nextPackageJson;
  },
};
