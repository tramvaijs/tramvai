import { table, TableUserConfig } from 'table';
import isEmpty from '@tinkoff/utils/is/empty';

import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import type { Result } from '../../api/benchmark';
import type { CompilationStats } from '../../api/benchmark/types';
import { DEFAULT_TIMES } from '../../api/benchmark/const';

import { app } from '../index';

export function toFixedDigits(num: number, digits = 2): number {
  if (digits === 0) {
    return Math.floor(num);
  }
  return +num.toFixed(digits);
}

const getUnit = (num: number) => (num > 1 ? 'mins' : 'min');

export function formatCosts(costs: number): string {
  // more than 1s
  if (costs >= 1000) {
    const sec = costs / 1000;
    // more than 1min
    if (sec >= 60) {
      let mins = sec / 60;

      mins = toFixedDigits(mins, 0);
      const mUnit = getUnit(mins);
      const restSec = toFixedDigits(sec % 60, 0);

      if (restSec > 0) {
        return `${mins}${mUnit} ${restSec}s`;
      }
      return `${mins}${mUnit}`;
    }

    return `${toFixedDigits(sec, 1)}s`;
  }

  if (costs >= 10) {
    return `${+toFixedDigits(costs, 0)}ms`;
  }

  if (costs >= 1) {
    return `${+toFixedDigits(costs, 1)}ms`;
  }

  let r = +toFixedDigits(costs, 2);

  if (r === 0) {
    r = +toFixedDigits(costs, 3);
  }

  return `${r}ms`;
}

const formatValues = (measures: Record<string, number>) => {
  const result: [string, string][] = [];

  for (const measureName in measures) {
    const measureValue = measures[measureName];
    result.push([measureName, formatCosts(measureValue)]);
  }

  return result;
};

const filterStats = (measures: Record<string, number>) => {
  const entries = Object.entries(measures);
  entries.sort((a, b) => b[1] - a[1]);

  return entries.slice(0, 5).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

const getInfo = (compilationStats: CompilationStats) => {
  const { totalBuildCosts, loaderBuildCosts, pluginBuildCosts } = compilationStats;

  const totalBuildInfo = formatValues(totalBuildCosts);
  const loaderInfo = formatValues(filterStats(loaderBuildCosts));
  const pluginInfo = formatValues(filterStats(pluginBuildCosts));

  return { totalBuildInfo, loaderInfo, pluginInfo };
};

const mergeTotalInfo = (
  server?: [string, string][] | undefined,
  client?: [string, string][] | undefined
) => {
  const result = [];

  for (let i = 0; i < (server?.length ?? client?.length); i++) {
    result.push([
      server?.[i][0] ?? client?.[i][0] ?? '-',
      server?.[i][1] ?? '0',
      client?.[i][1] ?? '0',
    ]);
  }

  return result;
};

const mergeAdditionalInfo = (
  server?: [string, string][] | undefined,
  client?: [string, string][] | undefined
) => {
  const result = [];

  for (let i = 0; i < (server?.length ?? client?.length); i++) {
    result.push([
      server?.[i][0] ?? '-',
      server?.[i][1] ?? '0',
      client?.[i][0] ?? '-',
      client?.[i][1] ?? 0,
    ]);
  }

  return result;
};

const formatBuildTime = (totalBuildTime) =>
  totalBuildTime ? `${(totalBuildTime / 1000).toFixed(2)}s` : '-';

const formatMemoryRss = (memoryRss) => (memoryRss ? `${(memoryRss / 1000000).toFixed(2)}mb` : '-');

const formatStatsTables = (stats: Result, times: number | undefined = DEFAULT_TIMES) => {
  const {
    clientBuildTime,
    clientCompilationStats,
    serverBuildTime,
    serverCompilationStats,
    maxMemoryRss,
    clientMaxMemoryRss,
    serverMaxMemoryRss,
  } = stats;
  const serverInfo = !isEmpty(serverCompilationStats) && getInfo(serverCompilationStats);
  const clientInfo = !isEmpty(clientCompilationStats) && getInfo(clientCompilationStats);

  const totalBuildData = [
    [`Mean durations (${times} times)`, 'server', 'client'],
    ['Total build time', formatBuildTime(serverBuildTime), formatBuildTime(clientBuildTime)],
    maxMemoryRss
      ? ['Total memory', formatMemoryRss(maxMemoryRss), '']
      : ['Total memory', formatMemoryRss(serverMaxMemoryRss), formatMemoryRss(clientMaxMemoryRss)],
    ...mergeTotalInfo(serverInfo.totalBuildInfo, clientInfo.totalBuildInfo),
  ].filter(Boolean);

  const totalBuildTableConfig: TableUserConfig = {
    columns: [{ alignment: 'left' }, { alignment: 'center' }, { alignment: 'center' }],
  };

  if (maxMemoryRss) {
    // @ts-expect-error
    totalBuildTableConfig.spanningCells = [{ col: 1, row: 2, colSpan: 2, alignment: 'center' }];
  }

  const mergedLoadersInfo = mergeAdditionalInfo(serverInfo.loaderInfo, clientInfo.loaderInfo);
  const mergedPluginsInfo = mergeAdditionalInfo(serverInfo.pluginInfo, clientInfo.pluginInfo);
  const additionalBuildData = [
    ['server', '', 'client', ''],
    ['Loaders', '', '', ''],
    ...mergedLoadersInfo,
    ['Plugins', '', '', ''],
    ...mergedPluginsInfo,
  ];

  const additionalBuildTableConfig: TableUserConfig = {
    spanningCells: [
      { col: 0, row: 0, colSpan: 2, alignment: 'center' },
      { col: 2, row: 0, colSpan: 2, alignment: 'center' },
      { col: 0, row: 1, colSpan: 4, alignment: 'center' },
      { col: 0, row: mergedLoadersInfo.length + 2, colSpan: 4, alignment: 'center' },
    ],
  };

  return [
    table(totalBuildData, totalBuildTableConfig),
    table(additionalBuildData, additionalBuildTableConfig),
  ];
};

export default async (_context: Context, parameters): Promise<CommandResult | any> => {
  const { command, times, ...commandOptions } = parameters;

  const stats = await app.run('benchmark', { command, times, commandOptions });

  formatStatsTables(stats, times).forEach((buildTable) => console.log(buildTable));

  return Promise.resolve({
    status: 'ok',
  });
};
