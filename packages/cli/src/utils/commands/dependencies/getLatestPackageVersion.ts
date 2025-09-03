import ora from 'ora';
import latestVersion from 'latest-version';

export const getLatestPackageVersion = async (
  packageName: string,
  version = 'latest',
  silent = false
) => {
  const spinner = silent
    ? null
    : ora(`Resolving the highest version satifying to ${version}`).start();

  try {
    const result = await latestVersion(packageName, { version });

    return result;
  } finally {
    if (spinner) {
      spinner.stop();
    }
  }
};
