import { parse, minVersion } from 'semver';
import fs from 'fs';
import pMap from 'p-map';
import type { Ora } from 'ora';
import ora from 'ora';
import { resolve } from 'path';
import { packageHasVersion } from '../../utils/commands/dependencies/packageHasVersion';
import { getLibPackageVersion } from './dependantLibs';
import { isDependantLib, isUnifiedVersion } from '../../utils/tramvaiVersions';

const getVersionFromDep = (dep?: string) => {
  if (dep) {
    return parse(dep)?.version || minVersion(dep)?.version;
  }
};

const updateDependencies = (
  dependencies: Record<string, string> = {},
  targetVersion: string,
  prerelease: boolean,
  currentVersion: string,
  spinner: Ora
) => {
  return pMap<string, void>(
    Object.keys(dependencies),
    async (dep) => {
      let nextVersion: string | undefined;

      if (isUnifiedVersion(dep) && getVersionFromDep(dependencies[dep]) === currentVersion) {
        nextVersion = targetVersion;
      } else if (isDependantLib(dep)) {
        const libVersion = await getLibPackageVersion(dep, targetVersion, prerelease);
        nextVersion = libVersion;
      }

      if (nextVersion) {
        const depHasVersion = await packageHasVersion(dep, nextVersion);

        // clear the spinner to be able to log info that should be preserved in the output
        // the idea borrowed from [here](https://github.com/sindresorhus/ora/issues/120)
        spinner.clear();

        if (depHasVersion) {
          console.log(`- ${dep}@${nextVersion}`);
          // eslint-disable-next-line no-param-reassign
          dependencies[dep] = nextVersion;
        } else {
          console.warn(
            `⚠️ cannot update ${dep} to ${nextVersion} version, this version does not exist.
    Maybe this package was removed or renamed.
    Wait migrations, then manually update or remove dependency from package.json, if necessary.`
          );
        }

        // start the spinner back with the initial text
        spinner.start(spinner.text);
      }
    },
    {
      concurrency: 10,
    }
  );
};

export const updatePackageJson = async (
  version: string,
  currentVersion: string,
  prerelease?: boolean,
  path = '.'
) => {
  const packageJsonPath = resolve(path, 'package.json');
  const file = fs.readFileSync(packageJsonPath);
  const content = JSON.parse(file.toString());

  const spinner = ora(`Updating package.json versions`).start();

  try {
    await updateDependencies(content.dependencies, version, prerelease, currentVersion, spinner);
    await updateDependencies(content.devDependencies, version, prerelease, currentVersion, spinner);
    await updateDependencies(
      content.peerDependencies,
      version,
      prerelease,
      currentVersion,
      spinner
    );

    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2));
  } finally {
    spinner.stop();
  }
};
