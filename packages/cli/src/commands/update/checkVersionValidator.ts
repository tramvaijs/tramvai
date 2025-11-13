import { packageHasVersion } from '../../utils/commands/dependencies/packageHasVersion';
import type { Params } from './update';

export const checkVersion = async (context, { to: version = 'latest' }: Params) => {
  if (version === 'latest') {
    return {
      name: 'checkVersion',
      status: 'ok',
    };
  }

  const registryUrl = await context.packageManager.getRegistryUrl();

  if (await packageHasVersion('@tramvai/core', version, registryUrl)) {
    return {
      name: 'checkVersion',
      status: 'ok',
    };
  }

  throw new Error(`Tramvai version ${version} does not exist`);
};
