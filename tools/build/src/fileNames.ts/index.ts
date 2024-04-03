import { extname } from 'path';
import isObject from '@tinkoff/utils/is/object';
import isString from '@tinkoff/utils/is/string';
import type { BuildParams } from '../builds/build.h';
import { normalizeFilenameForBrowserObjectField } from '../packageJson';

export const defaultSourceDir = 'src';
export const sourceExt = '.ts';

export const getOutputDir = (output: string): string => {
  const outputParts = output.split('/');
  const outputDir = outputParts[0] === '.' ? outputParts[1] : outputParts[0];

  return outputDir;
};

export const getSourceFromOutput = (sourceDir: string, output: string): string => {
  const outputDir = getOutputDir(output);
  const outputExt = extname(output);

  return output.replace(outputDir, sourceDir).replace(outputExt, sourceExt);
};

export const getSourceFilename = ({ options, packageJSON }: BuildParams): string => {
  return getSourceFromOutput(options.sourceDir, packageJSON.main);
};

/**
 * Returns the filename of the browser entrypoint from package.json
 *
 * From `{ "browser": "lib/browser.js", "main": "lib/server.js" }` will return `"lib/browser.js"`
 * From `{ "browser": { "lib/server.js": "lib/browser.js" }, "main": "lib/server.js" }` will return `"lib/browser.js"`
 * From `{ "browser": { "lib/anotherFile.js": "lib/anotherFile.browser.js" }, "main": "lib/server.js" }` will return `"lib/server.js"`
 * From `{ "main": "lib/server.js" }` will return `"lib/server.js"`
 */
export const getBrowserEntryFilename = (params: BuildParams): string => {
  const { browser, main } = params.packageJSON;
  const normalizedMain = normalizeFilenameForBrowserObjectField(main);

  if (isString(browser)) {
    return browser;
  }
  if (isObject(browser)) {
    return normalizedMain in browser ? browser[normalizedMain] : main;
  }
  return main;
};

export const getBrowserSourceFilename = (params: BuildParams): string => {
  const { browser } = params.packageJSON;
  const { sourceDir } = params.options;

  if (!browser) {
    return getSourceFilename(params);
  }

  const entryBrowserFilename = getBrowserEntryFilename(params);

  return getSourceFromOutput(sourceDir, entryBrowserFilename);
};
