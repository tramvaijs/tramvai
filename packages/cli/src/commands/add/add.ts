import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import { migrate } from '../../utils/commands/dependencies/migrate';
import { findTramvaiVersion } from '../../utils/commands/dependencies/findTramvaiVersion';
import { checkVersions } from '../../utils/commands/dependencies/checkVersions';

export type Params = {
  packageNames: string | string[];
  dev?: boolean;
};

export default async (context: Context, { packageNames, dev }: Params): Promise<CommandResult> => {
  const version = await findTramvaiVersion();

  if (!version) {
    throw new Error(
      'Could not resolve tramvai version from package.json. Do you have @tramvai/core installed?'
    );
  }

  await context.packageManager.install({
    packageNames,
    version,
    devDependency: dev,
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
