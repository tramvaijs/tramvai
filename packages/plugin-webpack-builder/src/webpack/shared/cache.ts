import path from 'node:path';
import fs from 'node:fs';
import crypto from 'crypto';

import findCacheDir from 'find-cache-dir';
import type { Configuration } from 'webpack';
import { createToken } from '@tinkoff/dippy';

import { ConfigService } from '@tramvai/api/lib/config';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';
import { getPostcssConfigPath } from './styles';
import { WebpackTranspilerInputParameters } from './transpiler';

export const CACHE_ADDITIONAL_FLAGS_TOKEN = createToken<string[]>(
  'tramvai webpack cache additional flags',
  { multi: true }
);

const getConfigCacheNameAdditionalFlags = (
  configManager: ConfigService,
  additionalCacheFlags: string[] | string[][]
) => {
  return [
    // configManager.debug ? 'debug' : '',
    process.env.TRAMVAI_REACT_PROFILE ? 'tramvai_react_profile' : '',
    configManager.resolveSymlinks ? '' : 'preserve_symlinks',
    ...additionalCacheFlags,
  ];
};

const filterNonExisted = (filePaths: string[]) => {
  return filePaths.filter((filePath) => {
    return filePath && fs.existsSync(filePath);
  });
};

export const createCacheConfig = ({
  config,
  additionalCacheFlags,
  transpilerParameters,
  target,
}: {
  config: ConfigService;
  additionalCacheFlags: string[] | string[][];
  transpilerParameters: WebpackTranspilerInputParameters;
  target: 'client' | 'server';
}): Configuration['cache'] => {
  // always disable build cache in CI
  if (process.env.CI) {
    return false;
  }

  const transpilerParametersHash = crypto.createHash('sha256');
  transpilerParametersHash.update(JSON.stringify(transpilerParameters));

  if (config.fileCache) {
    const { rootDir, cacheProfile } = config;
    const cacheFileName = [
      config.mode,
      config.projectType,
      target,
      config.projectName,
      transpilerParametersHash.digest('hex').substring(0, 6),
      getConfigCacheNameAdditionalFlags(config, additionalCacheFlags),
    ]
      .flat()
      .filter(Boolean)
      .join('-');

    return {
      type: 'filesystem',
      name: cacheFileName,
      profile: cacheProfile,
      cacheDirectory: findCacheDir({ cwd: rootDir, name: 'webpack' }),
      buildDependencies: {
        api: ['@tramvai/api'],
        webpack: ['webpack/lib'],
        // first check that config exists. If it is passed to webpack, but file is not exist the cache will not be created at all.
        // It may be missing in cases when cli is running programmaticaly
        config: filterNonExisted([
          path.resolve(rootDir, 'tramvai.json'),
          path.resolve(rootDir, 'tramvai.config.ts'),
        ]),
        css: filterNonExisted([safeRequireResolve(getPostcssConfigPath(config), true)]),
      },
      // https://github.com/vercel/next.js/commit/ff5338ce03a3240a97a5c84f5ad5c31c0f53a6ce
      compression: false,
    };
  }

  return { type: 'memory' };
};
