import { parse, minVersion } from 'semver';
import fs from 'fs/promises';

const getVersionFromDep = (dep?: string) => {
  if (dep) {
    return parse(dep)?.version || minVersion(dep)?.version;
  }
};

export const findTramvaiVersion = async () => {
  const file = await fs.readFile('package.json', { encoding: 'utf-8' });

  const content = JSON.parse(file);

  return getVersionFromDep(
    content.devDependencies['@tramvai/cli'] ?? content.dependencies['@tramvai/cli']
  );
};
