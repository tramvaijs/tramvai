import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import { getLatestPackageVersion } from '../../utils/commands/dependencies/getLatestPackageVersion';
import { migrate } from '../../utils/commands/dependencies/migrate';
import { updatePackageJson } from './updatePackageJson';
import { checkVersions } from '../../utils/commands/dependencies/checkVersions';
import moduleVersion from '../../utils/moduleVersion';
import { findTramvaiVersion } from '../../utils/commands/dependencies/findTramvaiVersion';

export type Params = {
  to: string;
  tag?: boolean;
};

export default async (
  context: Context,
  { to: version = 'latest', tag }: Params
): Promise<CommandResult> => {
  const resolvedVersion = tag ? version : await getLatestPackageVersion('@tramvai/cli', version);
  const currentVersion = await findTramvaiVersion();

  if (!currentVersion) {
    throw new Error(
      'Could not resolve tramvai version from package.json. Do you have @tramvai/core installed?'
    );
  }

  if (currentVersion === version || currentVersion === resolvedVersion) {
    throw new Error(
      'The installed version is equal to the current version, no update is required.'
    );
  }

  context.logger.event({
    type: 'info',
    event: 'resolving-version',
    message: `Next tramvai version resolved to ${tag ? 'tag' : 'version'} "${resolvedVersion}", current version is "${currentVersion}"`,
  });

  if (context.packageManager.workspaces) {
    await Promise.all(
      context.packageManager.workspaces.map((directory) =>
        updatePackageJson(version, resolvedVersion, currentVersion, tag, directory)
      )
    );
  }

  await updatePackageJson(version, resolvedVersion, currentVersion, tag);

  context.logger.event({
    type: 'info',
    event: 'install',
    message: 'Installing dependencies',
  });

  await context.packageManager.install({ stdio: 'inherit' });

  if (context.packageManager.name !== 'npm') {
    // npm dedupe is extremely slow in most cases
    // so execute it only for yarn
    context.logger.event({
      type: 'info',
      event: 'dedupe',
      message: 'Deduplicate dependencies',
    });

    await context.packageManager.dedupe({ stdio: 'inherit' });
  }

  await migrate(context);

  await checkVersions(context);

  if (context.packageManager.name === 'npm') {
    context.logger.event({
      type: 'warning',
      event: 'dedupe',
      message:
        'To make sure the node_modules tree is optimized you can additionaly run `npm dedupe` command',
    });
  }

  return Promise.resolve({
    status: 'ok',
  });
};
