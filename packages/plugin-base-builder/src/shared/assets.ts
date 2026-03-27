import { ConfigService } from '@tramvai/api/lib/config';

import type { Config as SvgoConfig } from 'svgo';

export const getSvgoOptions = (config: ConfigService): SvgoConfig & { configFile?: boolean } => {
  return {
    configFile: false,
    plugins: config.svgo?.plugins ?? [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
            collapseGroups: false,
          },
        },
      },
    ],
  };
};
