import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import { migrate } from '../../utils/commands/dependencies/migrate';
import { findTramvaiVersion } from '../../utils/commands/dependencies/findTramvaiVersion';
import { checkVersions } from '../../utils/commands/dependencies/checkVersions';
import { getWorkspaceRootByAppName } from '../../utils/commands/dependencies/getWorkspaceRootByAppName';

export type Params = {
  packageNames: string | string[];
  dev?: boolean;
  app?: string;
};

export default async (
  context: Context,
  { packageNames, dev, app }: Params
): Promise<CommandResult> => {
  const version = await findTramvaiVersion();

  if (!version) {
    throw new Error(
      'Could not resolve tramvai version from package.json. Do you have @tramvai/core installed?'
    );
  }

  const workspace = app ? getWorkspaceRootByAppName(context, app) : undefined;

  if (workspace && !context.packageManager.isWorkspaceExists(workspace)) {
    throw new Error(
      `Workspace ${workspace} for app ${app} is not exists. Check your package.json and tramvai.json`
    );
  }

  await context.packageManager.install({
    packageNames,
    version,
    devDependency: dev,
    workspace,
    stdio: 'inherit',
  });

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

  return Promise.resolve({
    status: 'ok',
  });
};
