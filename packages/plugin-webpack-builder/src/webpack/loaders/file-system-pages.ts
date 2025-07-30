import path from 'node:path';
import fs from 'node:fs';
import webpack from 'webpack';
import { FileSystemPagesOptions } from '@tramvai/api/lib/config';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';

export const LAYOUT_FILENAME = '_layout.tsx';
export const ERROR_BOUNDARY_FILENAME = '_error.tsx';
export const WILDCARD_TOKEN = '[...';

export interface FileSystemPagesLoaderOptions {
  rootDir: string;
  sourceDir: string;
  extensions: string[];
  fileSystemPages: FileSystemPagesOptions;
}

const removeExtension = (filename: string): string => {
  const parsed = path.parse(filename);

  return path.join(parsed.dir, parsed.name);
};

// fixing issue with absolute path imports on Windows
const normalizePath = (pathToNormalize: string) => {
  return pathToNormalize.replace(/\\/g, '\\\\');
};

const readdirAsync = async (
  dir: string,
  prefix = '',
  filelist = [] as string[],
  filter = (file: string) => true
) => {
  const files = await fs.promises.readdir(dir).catch(() => []);

  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = await fs.promises.stat(filepath);

    if (stat.isDirectory()) {
      // eslint-disable-next-line no-param-reassign
      filelist = await readdirAsync(filepath, path.join(prefix, file), filelist, filter);
    } else if (filter(file)) {
      filelist.push(path.join(prefix, file));
    }
  }

  return filelist;
};
// eslint-disable-next-line func-style
export const fileSystemPagesLoader: webpack.LoaderDefinitionFunction<FileSystemPagesLoaderOptions> =
  async function fileSystemPagesLoader() {
    const loaderOptions = this.getOptions();
    const { fileSystemPages, sourceDir, rootDir, extensions } = loaderOptions;
    const extensionsRegexp = new RegExp(`\\.(${extensions.map((ext) => ext.slice(1)).join('|')})$`);
    const fsLayouts: string[] = [];
    const fsErrorBoundaries: string[] = [];
    const fsWildcards: string[] = [];

    // eslint-disable-next-line max-statements
    const filesToPages = async ({
      pagesRootDirectory,
      isRoutes = false,
      test,
    }: {
      pagesRootDirectory: string;
      isRoutes?: boolean;
      test: RegExp;
    }) => {
      const pagesDir = resolveAbsolutePathForFile({
        file: pagesRootDirectory,
        sourceDir,
        rootDir,
      });

      // TODO: too many watchers, slow build?
      // TODO: unnecessary rebuild after initial compilation if folder is not exists
      this.addContextDependency(pagesDir);
      this.addMissingDependency(pagesDir);

      // skip service files
      const pagesFiles = await readdirAsync(
        pagesDir,
        '',
        [],
        (name: string) => name[0] !== '.' && name[0] !== '_' && !name.startsWith(WILDCARD_TOKEN)
      );
      const fsPages = [];

      for (const file of pagesFiles) {
        const extname = path.extname(file);
        const normalizedFile = file.replace(/\\/g, '/');

        if (test.test(normalizedFile)) {
          const name = normalizedFile.replace(new RegExp(`\\${extname}$`), '');
          const pageComponentName = `@/${pagesRootDirectory}/${name}`;
          const pageComponentPath = normalizePath(path.resolve(pagesDir, name));
          const chunkname = pageComponentName.replace(/\//g, '_');

          // @example '@/pages/MainPage': lazy(() => import(/* webpackChunkName: "@_pages_MainPage" */ '/tramvai-app/src/pages/MainPage'))
          fsPages.push(
            `'${pageComponentName}': lazy(() => import(/* webpackChunkName: "${chunkname}" */ '${pageComponentPath}'))`
          );

          if (isRoutes) {
            const pageDirname = path.dirname(pageComponentPath);

            const layoutPath = path.join(pageDirname, LAYOUT_FILENAME);
            const errorBoundaryPath = path.join(pageDirname, ERROR_BOUNDARY_FILENAME);

            const routeContent = (await fs.promises.readdir(pageDirname, { withFileTypes: true }))
              .filter((item) => item.isFile())
              .map((item) => item.name);
            const wildcardPath = routeContent.find((item) => item.includes(WILDCARD_TOKEN));

            if (fs.existsSync(layoutPath)) {
              const filename = normalizePath(removeExtension(layoutPath));
              // @example '@/pages/MainPage': lazy(() => import(/* webpackChunkName: "@_pages_MainPage__layout" */ '/tramvai-app/src/pages/MainPage_layout'))
              fsLayouts.push(
                `'${pageComponentName}': lazy(() => import(/* webpackChunkName: "${chunkname}__layout" */ '${filename}'))`
              );
            }

            if (fs.existsSync(errorBoundaryPath)) {
              const filename = normalizePath(removeExtension(errorBoundaryPath));

              // @example '@/pages/MainPage': lazy(() => import(/* webpackChunkName: "@_pages_MainPage__errorBoundary" */ '/tramvai-app/src/pages/MainPage_errorBoundary'))
              fsErrorBoundaries.push(
                `'${pageComponentName}': lazy(() => import(/* webpackChunkName: "${chunkname}__errorBoundary" */ '${filename}'))`
              );
            }

            if (wildcardPath !== undefined) {
              const componentName = `${pageComponentName}__wildcard`;
              const filename = normalizePath(removeExtension(path.join(pageDirname, wildcardPath)));

              // @example '@/pages/MainPage': lazy(() => import(/* webpackChunkName: "@_pages_MainPage__wildcard" */ '/tramvai-app/src/pages/MainPage_wildcard'))
              fsWildcards.push(
                `'${componentName}': lazy(() => import(/* webpackChunkName: "${chunkname}__wildcard" */ '${filename}'))`
              );
            }
          }
        }
      }

      return fsPages;
    };

    const fsRoutes = fileSystemPages.routesDir
      ? await filesToPages({
          pagesRootDirectory: fileSystemPages.routesDir,
          isRoutes: true,
          test: new RegExp(`index${extensionsRegexp.source}`),
        })
      : [];
    const fsPages = fileSystemPages.pagesDir
      ? await filesToPages({
          pagesRootDirectory: fileSystemPages.pagesDir,
          test: fileSystemPages.componentsPattern
            ? new RegExp(fileSystemPages.componentsPattern)
            : extensionsRegexp,
        })
      : [];

    const code = `import { lazy } from '@tramvai/react';

  export default {
    routes: {
      ${fsRoutes.join(',\n')}
    },
    pages: {
      ${fsPages.join(',\n')}
    },
    layouts: {
      ${fsLayouts.join(',\n')}
    },
    errorBoundaries: {
      ${fsErrorBoundaries.join(',\n')}
    },
    wildcards: {
      ${fsWildcards.join(',\n')}
    },
  }`;

    return code;
  };

// eslint-disable-next-line import/no-default-export
export default fileSystemPagesLoader;
