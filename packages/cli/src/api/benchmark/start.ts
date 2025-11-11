/* eslint-disable max-statements */
import type { Container } from '@tinkoff/dippy';
import type { Params as OriginalStartParams, Result as OriginalStartResult } from '../start/index';
import { COMMAND_PARAMETERS_TOKEN, COMMAND_RUNNER_TOKEN } from '../../di/tokens';
import type { Params, Result } from './index';
import type { Samples, CompilationStats } from './types';
import { clearCacheDirectory } from './utils/clearCache';
import { getResultStats } from './utils/stats';
import { getClientCompilationTimings, getServerCompilationTimings } from './utils/compilationUtils';
import { DEFAULT_TIMES } from './const';

export interface StartParams extends Params {
  command: 'start';
  commandOptions: OriginalStartParams;
}

const runStartCommand = async (
  di: Container,
  {
    times,
    shouldClearCache,
  }: {
    times: number;
    shouldClearCache: boolean;
  }
): Promise<Samples> => {
  const clientBuildTimeSamples: number[] = [];
  const serverBuildTimeSamples: number[] = [];
  const clientMaxMemoryRssSamples: number[] = [];
  const serverMaxMemoryRssSamples: number[] = [];

  const serverCompilationTimings: CompilationStats[] = [];
  const clientCompilationTimings: CompilationStats[] = [];

  const maxMemoryRssSamples: number[] = [];

  const { commandOptions } = di.get(COMMAND_PARAMETERS_TOKEN) as StartParams;
  commandOptions.benchmark = true;

  const buildType = commandOptions.buildType ?? 'all';

  const benchmarkStartTime = new Date().toISOString();

  for (let i = 0; i < times; i++) {
    if (shouldClearCache) {
      await clearCacheDirectory(di);
    }

    const attemptStartTime = Date.now();
    const { close, getBuildStats } = await (di
      .get(COMMAND_RUNNER_TOKEN)
      .run('start', commandOptions) as OriginalStartResult);
    const stats = getBuildStats();

    await close();

    // at first attempt do not save metrics if cache is used
    if (!shouldClearCache && i === 0) {
      continue;
    }

    if (buildType === 'all' || buildType === 'server') {
      serverCompilationTimings.push(
        await getServerCompilationTimings(benchmarkStartTime, attemptStartTime, i)
      );
      serverBuildTimeSamples.push(stats.server.buildTime);

      if (stats.server.maxMemoryRss) {
        serverMaxMemoryRssSamples.push(stats.server.maxMemoryRss);
      }
    }

    if (buildType === 'all' || buildType === 'client') {
      clientCompilationTimings.push(
        await getClientCompilationTimings(benchmarkStartTime, attemptStartTime, i)
      );
      clientBuildTimeSamples.push(stats.client.buildTime);

      if (stats.client.maxMemoryRss) {
        clientMaxMemoryRssSamples.push(stats.client.maxMemoryRss);
      }
    }

    if (stats.maxMemoryRss) {
      maxMemoryRssSamples.push(stats.maxMemoryRss);
    }
  }

  return {
    serverCompilationTimings,
    clientCompilationTimings,
    clientMaxMemoryRssSamples,
    serverMaxMemoryRssSamples,
    clientBuildTimeSamples,
    serverBuildTimeSamples,
    maxMemoryRssSamples,
  };
};

export const benchmarkStart = async (di: Container): Promise<Result> => {
  const { times = DEFAULT_TIMES, commandOptions } = di.get(COMMAND_PARAMETERS_TOKEN) as Params;
  const noCache = !commandOptions.fileCache;

  let result;

  if (noCache) {
    result = await runStartCommand(di, {
      times,
      shouldClearCache: true,
    });
  } else {
    result = await runStartCommand(di, {
      // additional first attempt for cache warmup
      times: times + 1,
      shouldClearCache: false,
    });
  }

  return getResultStats(result);
};
