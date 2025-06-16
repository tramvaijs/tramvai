import path from 'node:path';

export const resolveAbsolutePathForEntry = ({
  entry,
  sourceDir,
  rootDir,
}: {
  entry: string;
  sourceDir: string;
  rootDir: string;
}): string => {
  if (path.isAbsolute(entry)) {
    return entry;
  }
  if (path.isAbsolute(sourceDir)) {
    return path.join(sourceDir, entry);
  }
  if (path.isAbsolute(rootDir)) {
    return path.join(rootDir, sourceDir, entry);
  }
  return path.resolve(rootDir, sourceDir, entry);
};

export const resolveAbsolutePathForOutput = ({
  output,
  rootDir,
}: {
  output: string;
  rootDir: string;
}): string => {
  if (path.isAbsolute(output)) {
    return output;
  }
  if (path.isAbsolute(rootDir)) {
    return path.join(rootDir, output);
  }
  return path.resolve(rootDir, output);
};
