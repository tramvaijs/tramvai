import ora from 'ora';
import latestVersion from 'latest-version';

export const getLatestPackageVersion = async (
  packageName: string,
  registryUrl: string,
  version = 'latest',
  silent = false
) => {
  const spinner = silent
    ? null
    : ora(`Resolving the highest version satifying to ${version}`).start();

  try {
    // underlying `registry-url` package uses only `.npmrc` file to resolve registry URL
    // @ts-expect-error uncomplete type definition, `registryUrl` is supported
    const result = await latestVersion(packageName, { version, registryUrl });

    return result;
  } finally {
    if (spinner) {
      spinner.stop();
    }
  }
};
