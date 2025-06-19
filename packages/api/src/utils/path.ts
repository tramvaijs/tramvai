import path from 'node:path';

export const resolveAbsolutePathForFile = ({
  file,
  sourceDir,
  rootDir,
}: {
  file: string;
  sourceDir: string;
  rootDir: string;
}): string => {
  if (path.isAbsolute(file)) {
    return file;
  }
  if (path.isAbsolute(sourceDir)) {
    return path.join(sourceDir, file);
  }
  if (path.isAbsolute(rootDir)) {
    return path.join(rootDir, sourceDir, file);
  }
  return path.resolve(rootDir, sourceDir, file);
};

export const resolveAbsolutePathForFolder = ({
  folder,
  rootDir,
}: {
  folder: string;
  rootDir: string;
}): string => {
  if (path.isAbsolute(folder)) {
    return folder;
  }
  if (path.isAbsolute(rootDir)) {
    return path.join(rootDir, folder);
  }
  return path.resolve(rootDir, folder);
};
