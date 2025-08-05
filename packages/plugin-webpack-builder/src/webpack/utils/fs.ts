import path from 'node:path';
import fs from 'node:fs';

export const readdirAsync = async (
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
