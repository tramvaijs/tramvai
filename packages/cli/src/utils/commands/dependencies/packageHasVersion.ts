import latestVersion from 'latest-version';

export const packageHasVersion = async (
  packageName: string,
  version: string,
  registryUrl: string
): Promise<boolean> => {
  try {
    // @ts-expect-error uncomplete type definition, `registryUrl` is supported
    await latestVersion(packageName, { version, registryUrl });
    return true;
  } catch (e) {
    return false;
  }
};
