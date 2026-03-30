import path from 'node:path';
import fs from 'node:fs';

import { ConfigService } from '@tramvai/api/lib/config';

export function getResolveTsConfig(config: ConfigService) {
  const { rootDir, sourceDir } = config;
  const appTsconfigPath = path.resolve(rootDir, sourceDir, 'tsconfig.json');
  const tsConfigPath = path.join(rootDir, 'tsconfig.json');

  let configFile;

  if (fs.existsSync(appTsconfigPath)) {
    configFile = appTsconfigPath;
  } else if (fs.existsSync(tsConfigPath)) {
    configFile = tsConfigPath;
  }

  if (configFile) {
    return {
      tsConfig: {
        configFile,
      },
    };
  }

  return {};
}
