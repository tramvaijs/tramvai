import os from 'node:os';
import type { Container } from '@tinkoff/dippy';
import * as threadLoader from 'thread-loader';
import { BUILD_MODE_TOKEN, BUILD_TARGET_TOKEN } from '../webpack-config';

export type WorkerPoolConfig = {
  name: string;
  poolTimeout?: number;
  workers?: number;
  workerNodeArgs?: string[];
};

function calculateNumberOfWorkers() {
  // There are situations when this call will return undefined so
  // we are fallback here to 1.
  // More info on: https://github.com/nodejs/node/issues/19022
  const cpus = os.cpus() || {
    length: 1,
  };
  // use a half of the available CPUs per different webpack worker
  return Math.max(1, cpus.length / 2 - 1);
}

export const createWorkerPoolConfig = ({ di }: { di: Container }): WorkerPoolConfig => {
  const mode = di.get(BUILD_MODE_TOKEN);
  const target = di.get(BUILD_TARGET_TOKEN);

  const config: WorkerPoolConfig = {
    poolTimeout: mode === 'development' ? Infinity : undefined,
    // TODO is it really necessary?
    // poolRespawn need to be true to allow cli benchmarks use pool across runs
    // as thread-loader has shared global state
    // poolRespawn: mode === 'development',

    // TODO add thread-loader options to ConfigService
    // ...getCustomConfig(config),

    name: `tramvai-worker-pool-for-${target}`,
    workers: calculateNumberOfWorkers(),
  };

  if (process.env.TRAMVAI_INSPECT_THREAD_LOADER) {
    const inspectPort = target === 'client' ? '9230' : '9231';

    config.workerNodeArgs = ['--inspect-brk', `--inspect=${inspectPort}`];
    config.workers = 1;
  }

  return config;
};

export const warmupThreadLoader = (workerPoolConfig: WorkerPoolConfig) => {
  // TODO: kill workers on close
  threadLoader.warmup(workerPoolConfig, [
    'babel-loader',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-decorators',
  ]);
};
