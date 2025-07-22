import path from 'node:path';
import type { ConfigService } from '@tramvai/api/lib/config';
import type { Configuration } from 'webpack';

export const createSnapshot = ({
  config,
}: {
  config: ConfigService;
}): Configuration['snapshot'] => {
  return config.inspectBuildProcess
    ? {
        // allow to debug node_modules
        managedPaths: [],
      }
    : {
        // TODO: check it is necessary for tramvai-debug or defaults will work properly
        managedPaths: [path.resolve(config.rootDir, 'node_modules')],
      };
};
