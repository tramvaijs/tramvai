import isObject from '@tinkoff/utils/is/object';
import type { Build, BuildParams } from './build.h';
import { createInputOptions, createOutputOptions } from './common';
import { getBrowserEntryFilename, getBrowserSourceFilename } from '../fileNames.ts';
import { normalizeFilenameForBrowserObjectField } from '../packageJson';
import { buildFileName as buildModuleFileName } from './node-es';

const buildFileName = (params: BuildParams) => {
  const mainFileName = params.packageJSON.main;
  const entryBrowserFilename = getBrowserEntryFilename(params);

  return entryBrowserFilename === mainFileName
    ? mainFileName.replace(/\.js$/, '.browser.js')
    : entryBrowserFilename;
};

export const build: Build = {
  name: 'browser',
  async shouldExecute({ packageJSON }) {
    return Boolean(packageJSON.main && packageJSON.browser);
  },
  async getOptions(params) {
    const mainFileName = params.packageJSON.main;
    const entryBrowserFilename = getBrowserEntryFilename(params);

    const input = createInputOptions(params, {
      browser: true,
      entry: getBrowserSourceFilename(params),
      target: 'ES2019',
      resolveMainFields: ['browser', 'module', 'main'],
    });
    const output = createOutputOptions(params, {
      file: buildFileName(params),
      format: 'esm',
      exportsField: 'auto',
      postfix: '.browser.js',
      // keep entry filename when browser entry point specified, e.g. `"browser": "lib/index.browser.js"`,
      // or `"browser": { "./lib/server.js": "./lib/browser.js" }, "main": "lib/server.js"`,
      // otherwise output file `lib/index.browser.browser.js` will be created
      postfixForEntry: entryBrowserFilename === mainFileName,
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
        [normalizeFilenameForBrowserObjectField(buildModuleFileName(params))]:
          normalizeFilenameForBrowserObjectField(outputFilename),
      };
    }

    delete nextPackageJson.es2017;

    return nextPackageJson;
  },
};
