import path from 'node:path';
import fs from 'node:fs';
import crypto from 'crypto';

import findCacheDir from 'find-cache-dir';
import type { ExperimentCacheOptions } from '@rspack/core';
import { createToken } from '@tinkoff/dippy';

import { ConfigService } from '@tramvai/api/lib/config';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';
import { getPostcssConfigPath } from './styles';
import { RspackTranspilerInputParameters } from './transpiler';

export const CACHE_ADDITIONAL_FLAGS_TOKEN = createToken<string[]>(
  'tramvai rspack cache additional flags',
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
  transpilerParameters: RspackTranspilerInputParameters;
  target: 'client' | 'server';
}): ExperimentCacheOptions => {
  const transpilerParametersHash = crypto.createHash('sha256');
  transpilerParametersHash.update(JSON.stringify(transpilerParameters));

  if (config.fileCache) {
    const { rootDir } = config;
    const cacheName = [
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
      type: 'persistent',
      version: cacheName,
      storage: {
        type: 'filesystem',
        directory: findCacheDir({ cwd: rootDir, name: 'rspack' }),
      },
      buildDependencies: [
        safeRequireResolve('@tramvai/api'),
        safeRequireResolve('@rspack/core'),
        ...filterNonExisted([
          path.resolve(rootDir, 'tramvai.json'),
          path.resolve(rootDir, 'tramvai.config.ts'),
          safeRequireResolve(getPostcssConfigPath(config), true),
        ]),
      ].filter(Boolean),
    };
  }

  return { type: 'memory' };
};
