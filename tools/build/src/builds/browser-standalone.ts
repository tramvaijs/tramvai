import isObject from '@tinkoff/utils/is/object';
import { ScriptTarget } from 'typescript';
import type { Build, BuildParams } from './build.h';
import { buildCheckExternal, plugins } from './common-standalone';
import { createInputOptions, createOutputOptions } from './common';
import { getBrowserEntryFilename, getBrowserSourceFilename } from '../fileNames.ts';
import { normalizeFilenameForBrowserObjectField } from '../packageJson';

export const buildFileName = (params: BuildParams) => {
  const entryBrowserFilename = getBrowserEntryFilename(params);

  return entryBrowserFilename;
};

export const build: Build = {
  name: 'browser:standalone',
  async shouldExecute({ packageJSON }) {
    return Boolean(packageJSON.main && packageJSON.browser);
  },
  async getOptions(params) {
    const input = createInputOptions(params, {
      entry: getBrowserSourceFilename(params),
      // packages will be transpiled by @tramvai/cli with browserslist target
      target: ScriptTarget.ES2022,
      resolveMainFields: ['browser', 'module', 'main'],
      browser: true,
      plugins,
      checkExternal: buildCheckExternal(params),
    });
    const output = createOutputOptions(params, {
      file: buildFileName(params),
      format: 'esm',
      exportsField: 'auto',
      postfix: '.js',
    });

    return {
      input,
      output,
    };
  },
  async modifyPackageJSON(params) {
    const outputFilename = buildFileName(params);
    const nextPackageJson = { ...params.packageJSON };

    if (isObject(params.packageJSON.browser)) {
      nextPackageJson.browser = {
        ...params.packageJSON.browser,
        [normalizeFilenameForBrowserObjectField(params.packageJSON.main)]:
          normalizeFilenameForBrowserObjectField(outputFilename),
      };
    }

    delete nextPackageJson.es2017;

    return nextPackageJson;
  },
};
