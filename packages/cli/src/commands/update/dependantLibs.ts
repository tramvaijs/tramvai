import getLatestPackageVersion from 'latest-version';
import getPackageInfo from 'package-json';
import type { Ora } from 'ora';
import { DEPENDANT_LIBS_MAP } from '../../utils/tramvaiVersions';

export const getLibPackageVersion = async (
  name: string,
  version: string,
  resolvedVersion: string,
  spinner: Ora
): Promise<string | undefined> => {
  const unifiedModule = DEPENDANT_LIBS_MAP.get(name);

  if (!unifiedModule) {
    try {
      return await getLatestPackageVersion(name, { version });
    } catch (e) {
      // clear the spinner to be able to log info that should be preserved in the output
      // the idea borrowed from [here](https://github.com/sindresorhus/ora/issues/120)
      spinner.clear();

      console.warn(`⚠️ cannot resolve proper version for the "${name}" package,
You have to update this package by yourself.`);

      return;
    }
  }

  const { dependencies } = await getPackageInfo(unifiedModule, { version: resolvedVersion });

  if (!dependencies[name]) {
    // clear the spinner to be able to log info that should be preserved in the output
    // the idea borrowed from [here](https://github.com/sindresorhus/ora/issues/120)
    spinner.clear();

    console.warn(`⚠️ cannot resolve proper version for the "${name}" package,
You have to update this package by yourself.`);

    return;
  }

  return dependencies[name];
};
