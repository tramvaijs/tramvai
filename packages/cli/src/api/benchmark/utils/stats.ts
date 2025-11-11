import type { RunStats, Samples, CompilationStats } from '../types';

function getMeanValue(samples: number[]) {
  if (samples.length === 0) {
    return;
  }

  let sum = 0;

  for (let i = 0; i < samples.length; i++) {
    sum += samples[i];
  }

  return sum / samples.length;
}

function getCompilationMeanStats(allStats) {
  const result = {} as CompilationStats;

  const stats: CompilationStats = allStats[0];

  for (const section in stats) {
    for (const metricName in stats[section]) {
      const samples = allStats.reduce((acc, item) => {
        acc.push(item[section][metricName]);
        return acc;
      }, []);

      if (!result[section]) {
        result[section] = {};
      }
      const meanValue = getMeanValue(samples);

      // ignore values less than 10ms
      if (meanValue > 10) {
        result[section][metricName] = meanValue;
      }
    }
  }

  return result;
}

export const getResultStats = ({
  clientBuildTimeSamples,
  clientCompilationTimings,
  clientMaxMemoryRssSamples,
  serverBuildTimeSamples,
  serverCompilationTimings,
  serverMaxMemoryRssSamples,
  maxMemoryRssSamples,
}: Samples): RunStats => {
  return {
    serverBuildTime: getMeanValue(serverBuildTimeSamples),
    serverCompilationStats: getCompilationMeanStats(serverCompilationTimings),
    clientBuildTime: getMeanValue(clientBuildTimeSamples),
    clientCompilationStats: getCompilationMeanStats(clientCompilationTimings),
    maxMemoryRss: getMeanValue(maxMemoryRssSamples),
    clientMaxMemoryRss: getMeanValue(clientMaxMemoryRssSamples),
    serverMaxMemoryRss: getMeanValue(serverMaxMemoryRssSamples),
  };
};
