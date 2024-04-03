import { isLockfileChanged } from '../../utils/lockfileHash';
import type { Validator } from './validator.h';
import { migrate } from '../../utils/commands/dependencies/migrate';
import { checkVersions } from '../../utils/commands/dependencies/checkVersions';

export const runMigrationsAndCheckVersions: Validator = async (context) => {
  if (isLockfileChanged(context)) {
    await migrate(context);
    await checkVersions(context);
  }

  return { name: 'runMigrationsAndCheckVersions', status: 'ok' };
};
