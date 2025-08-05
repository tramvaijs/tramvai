import path from 'node:path';
import fs from 'node:fs';
import webpack from 'webpack';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';
import { readdirAsync } from '../utils/fs';

export interface FileSystemPapiLoaderOptions {
  rootDir: string;
  sourceDir: string;
  fileSystemPapiDir: string;
  extensions: string[];
}

// TODO: TCORE-5228
// eslint-disable-next-line func-style
export const fileSystemPapiLoader: webpack.LoaderDefinitionFunction<FileSystemPapiLoaderOptions> =
  async function fileSystemPapiLoader() {
    const loaderOptions = this.getOptions();
    const { sourceDir, rootDir, fileSystemPapiDir, extensions } = loaderOptions;

    const papiDirectory = resolveAbsolutePathForFile({
      file: fileSystemPapiDir,
      sourceDir,
      rootDir,
    });

    if (!fs.existsSync(papiDirectory)) {
      return 'export default {};';
    }

    this.addContextDependency(papiDirectory);
    this.addMissingDependency(papiDirectory);

    const papiFiles = await readdirAsync(papiDirectory);

    if (!papiFiles.length) {
      return 'export default {};';
    }

    const content = [];

    for (const file of papiFiles) {
      const extname = path.extname(file);
      const name = file.replace(new RegExp(`\\${extname}$`), '').replace(/\\/g, '/');

      if (extensions.includes(extname)) {
        content.push(
          `'${name}': require('${path.resolve(papiDirectory, name).replace(/\\/g, '\\\\')}')`
        );
      }
    }

    return `export default {
  ${content.join(',\n')}
}`;
  };

// eslint-disable-next-line import/no-default-export
export default fileSystemPapiLoader;
