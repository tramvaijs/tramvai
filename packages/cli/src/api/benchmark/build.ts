/* eslint-disable max-statements */
import type { Container } from '@tinkoff/dippy';
import type { Params as OriginalBuildParams, Result as OriginalBuildResult } from '../build/index';
import { COMMAND_PARAMETERS_TOKEN, COMMAND_RUNNER_TOKEN } from '../../di/tokens';
import type { Params, Result } from './index';
import type { Samples, RunStats, CompilationStats } from './types';
import { clearCacheDirectory } from './utils/clearCache';
import { getResultStats } from './utils/stats';
import { getClientCompilationTimings, getServerCompilationTimings } from './utils/compilationUtils';
import { DEFAULT_TIMES } from './const';

export interface BuildParams extends Params {
  command: 'build';
  commandOptions: OriginalBuildParams;
}

const runBuildCommand = async (
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

  const { commandOptions } = di.get(COMMAND_PARAMETERS_TOKEN) as BuildParams;
  commandOptions.benchmark = true;

  const buildType = commandOptions.buildType ?? 'all';

  const benchmarkStartTime = new Date().toISOString();

  for (let i = 0; i < times; i++) {
    if (shouldClearCache) {
      await clearCacheDirectory(di);
    }

    const attemptStartTime = Date.now();
    const { getBuildStats } = await (di
      .get(COMMAND_RUNNER_TOKEN)
      .run('build', commandOptions) as OriginalBuildResult);
    const stats = getBuildStats();

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
        clientMaxMemoryRssSamples.push(stats.server.maxMemoryRss);
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
    clientBuildTimeSamples,
    serverBuildTimeSamples,
    maxMemoryRssSamples,
    clientMaxMemoryRssSamples,
    serverMaxMemoryRssSamples,
  };
};

export const benchmarkBuild = async (di: Container): Promise<Result> => {
  const { times = DEFAULT_TIMES, commandOptions } = di.get(COMMAND_PARAMETERS_TOKEN) as Params;
  const noCache = !commandOptions.fileCache;

  let result;

  if (noCache) {
    result = await runBuildCommand(di, {
      times,
      shouldClearCache: true,
    });
  } else {
    result = await runBuildCommand(di, {
      // additional first attempt for cache warmup
      times: times + 1,
      shouldClearCache: false,
    });
  }

  return getResultStats(result);
};
