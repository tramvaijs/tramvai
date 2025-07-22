import path from 'path';
import { safeRequire } from './require';
import { resolveAbsolutePathForFile, resolveAbsolutePathForFolder } from './path';

export const packageVersion = ({
  mode,
  sourceDir,
  rootDir,
}: {
  mode: 'development' | 'production';
  sourceDir: string;
  rootDir: string;
}): string => {
  if (mode !== 'production') {
    return '0.0.0-stub';
  }

  const packageJsonSrcPath = resolveAbsolutePathForFile({
    file: 'package.json',
    sourceDir,
    rootDir,
  });
  const packageJsonParentPath = path.join(path.dirname(packageJsonSrcPath), '..', 'package.json');
  const packageJsonRootPath = resolveAbsolutePathForFolder({
    folder: 'package.json',
    rootDir,
  });

  try {
    const modulePackageJson =
      // try to find package json for the child-app first in the directory that child-app resides
      safeRequire(packageJsonSrcPath, true) ??
      // also try one directory above if root directory is src
      safeRequire(packageJsonParentPath, true) ??
      // try the package.json that resides with tramvai.json
      safeRequire(packageJsonRootPath, true);

    return modulePackageJson.version;
  } catch (e) {
    return 'prerelease';
  }
};
