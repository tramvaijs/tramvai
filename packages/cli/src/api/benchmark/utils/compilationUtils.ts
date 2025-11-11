import fs from 'node:fs/promises';

import { CompilationStats, LoaderTransformData, MinimalLoaderData, PluginData } from '../types';

export async function getServerCompilationTimings(
  benchmarkStartTime: string,
  attemptStartTime: number,
  attempt: number
) {
  return getCompilationTimings(benchmarkStartTime, attemptStartTime, attempt, 'server');
}

export async function getClientCompilationTimings(
  benchmarkStartTime: string,
  attemptStartTime: number,
  attempt: number
) {
  return getCompilationTimings(benchmarkStartTime, attemptStartTime, attempt, 'client');
}

async function getCompilationTimings(
  benchmarkStartTime: string,
  attemptStartTime: number,
  attempt: number,
  type: 'client' | 'server'
): Promise<CompilationStats> {
  try {
    const rsdoctorData = await getReportData(
      await processReport(benchmarkStartTime, attempt, type)
    );

    const { summary, loader, plugin } = rsdoctorData;

    const totalBuildCosts = calculateTotalCosts(summary, attemptStartTime);
    const loaderBuildCosts = calculateLoadersCosts(loader);
    const pluginBuildCosts = calculatePluginsCosts(plugin);

    return { totalBuildCosts, loaderBuildCosts, pluginBuildCosts };
  } catch (err) {
    throw new Error(`Failed to get rsdoctor report!\n${err}`);
  }
}

async function getReportData(reportPath: string) {
  const rsdoctorRawStats = await fs.readFile(reportPath, 'utf-8');
  const rsdoctorStats = JSON.parse(rsdoctorRawStats);

  return rsdoctorStats.data;
}

async function processReport(
  benchmarkStartTime: string,
  attempt: number,
  type: 'client' | 'server'
) {
  const reportBasePath = `./.rsdoctor/${benchmarkStartTime}`;
  const reportPath = `${reportBasePath}/${type}-rsdoctor-data-${attempt + 1}.json`;

  await fs.mkdir(reportBasePath, { recursive: true });
  await fs.rename(`./.rsdoctor/${type}-rsdoctor-data.json`, reportPath);

  return reportPath;
}

function mergeIntervals(intervals: [number, number][]) {
  // Sort from small to large
  intervals.sort((a, b) => a[0] - b[0]);
  // The previous interval, the next interval, store the result
  let previous;
  let current;
  const result: [number, number][] = [];

  for (let i = 0; i < intervals.length; i++) {
    current = intervals[i];
    // If the first interval or the current interval does not overlap with the previous interval, add the current interval to the result
    if (!previous || current[0] > previous[1]) {
      // Assign the current interval to the previous interval
      previous = current;
      result.push(current);
    } else {
      // Otherwise, the two intervals overlap
      // Update the end time of the previous interval
      previous[1] = Math.max(previous[1], current[1]);
    }
  }

  return result;
}

function getLoadersCosts(
  filter: (loader: MinimalLoaderData) => boolean,
  loaders: MinimalLoaderData[]
) {
  const match: { [pid: number | string]: [start: number, end: number][] } = {};
  const others: { [pid: number | string]: [start: number, end: number][] } = {};

  loaders.forEach((e) => {
    if (filter(e)) {
      if (!match[e.pid]) match[e.pid] = [];
      match[e.pid].push([e.startAt, e.endAt]);
    } else {
      if (!others[e.pid]) others[e.pid] = [];
      others[e.pid].push([e.startAt, e.endAt]);
    }
  });

  let costs = 0;

  const pids = Object.keys(match);

  for (let i = 0; i < pids.length; i++) {
    const pid = pids[i];
    const _match = mergeIntervals(match[pid]);
    // between in loader.startAt and loader.endAt
    const _others = mergeIntervals(others[pid] || []).filter(([s, e]) =>
      _match.some((el) => s >= el[0] && e <= el[1])
    );

    // eslint-disable-next-line no-param-reassign
    const matchSum = _match.length ? _match.reduce((t, c) => (t += c[1] - c[0]), 0) : 0;
    // eslint-disable-next-line no-param-reassign
    const othersSum = _others.length ? _others.reduce((t, c) => (t += c[1] - c[0]), 0) : 0;

    costs += matchSum - othersSum;
  }

  return costs;
}

function calculateTotalCosts(
  summary: { costs: { name: string; cost: string }[] },
  attemptStartTime: number
) {
  const { costs: buildCosts } = summary;
  const buildCostsMap = buildCosts.reduce((acc, cost) => {
    acc[cost.name] = cost;
    return acc;
  }, {});

  const result: Record<string, number> = {};

  for (const buildCostName in buildCostsMap) {
    if (buildCostName === 'bootstrap->beforeCompile') {
      // start of bootstrap is start of first build, so use attemptStarTime instead
      result[buildCostName] =
        buildCostsMap['beforeCompile->afterCompile'].startAt - attemptStartTime;
    } else {
      result[buildCostName] = buildCostsMap[buildCostName].costs;
    }
  }

  return result;
}

function calculateLoadersCosts(loaders: { loaders: LoaderTransformData[] }[]) {
  const filteredLoaders: MinimalLoaderData[] = [];
  const uniqueLoaders = new Map<
    string,
    {
      files: number;
      path: string;
    }
  >();

  loaders.forEach((data) => {
    data.loaders.forEach((fl) => {
      const uniqueLoader = uniqueLoaders.get(fl.loader);
      if (uniqueLoader) {
        uniqueLoaders.set(fl.loader, {
          files: uniqueLoader.files + 1,
          path: fl.path,
        });
      } else {
        uniqueLoaders.set(fl.loader, { files: 1, path: fl.path });
      }

      return filteredLoaders.push({
        loader: fl.loader,
        startAt: fl.startAt,
        endAt: fl.endAt,
        pid: fl.pid,
      });
    });
  });

  const costs: Record<string, number> = {};
  uniqueLoaders.forEach((_, loaderName: string) => {
    costs[loaderName] = getLoadersCosts((item) => item.loader === loaderName, filteredLoaders);
  });

  return costs;
}

function calculatePluginsCosts(plugins: PluginData) {
  const pluginCosts: Record<string, number> = {};

  for (const hookName in plugins) {
    const hookCalls = plugins[hookName];

    hookCalls.forEach((plugin) => {
      const pluginName = plugin.tapName;
      const pluginCost = plugin.costs;

      if (pluginCosts[pluginName]) {
        pluginCosts[pluginName] += pluginCost;
      } else {
        pluginCosts[pluginName] = pluginCost;
      }
    });
  }

  return pluginCosts;
}
