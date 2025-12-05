import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import { Writable } from 'stream';
import envCi from 'env-ci';
import type { PromiseType } from 'utility-types';
import { build } from '@tramvai/cli';
import type { BuildOptions } from './types';

const ciInfo = envCi();

export interface BuildCliOptions extends Omit<BuildOptions, 'config' | 'target'> {
  logger?: Pick<typeof console, 'log' | 'error'>;
}

export const buildCli = async (
  targetOrConfig: BuildOptions['target'] | BuildOptions['config'],
  { env, logger = console, ...cliOptions }: BuildCliOptions = {}
) => {
  const stdout = new Writable({
    write(chunk, encoding, callback) {
      logger.log(`[@tramvai/cli] log:`, chunk.toString());

      callback();
    },
  });
  const stderr = new Writable({
    write(chunk, encoding, callback) {
      logger.error(`[@tramvai/cli] error:`, chunk.toString());

      callback();
    },
  });

  const cliResult = await build({
    stdout,
    stderr,
    // build cache made tests unstable in CI, because of cache writing process are async,
    // and there is no way to wait this process (`idleTimeoutForInitialStore: 0` helps sometimes, but no guarantees)
    fileCache: cliOptions.fileCache ?? !ciInfo.isCi,
    // faster builds with debug flag, sm still will be disabled by default
    sourceMap: cliOptions.sourceMap ?? false,
    ...(typeof targetOrConfig === 'string'
      ? { target: targetOrConfig }
      : {
          config: mergeDeep(
            {
              // faster builds
              sourceMap: false,
              // faster builds
              experiments: {
                transpilation: {
                  loader: 'swc',
                },
              },
            },
            targetOrConfig
          ),
        }),
    env: {
      ...env,
    },
    ...cliOptions,
  });

  return {
    ...cliResult,
    stdout,
    stderr,
  };
};
export type BuildCliResult = PromiseType<ReturnType<typeof buildCli>>;
