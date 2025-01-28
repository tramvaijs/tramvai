import latestVersion from 'latest-version';
import type { Params } from './add';

export const checkPackage = async (_, { packageNames }: Params) => {
  if (Array.isArray(packageNames)) {
    await Promise.all(packageNames.map((packageName) => latestVersion(packageName)));
  } else {
    await latestVersion(packageNames);
  }

  return {
    name: 'checkPackage',
    status: 'ok',
  };
};
