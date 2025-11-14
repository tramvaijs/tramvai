import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import { COMMAND_PARAMETERS_TOKEN, WITH_BUILD_STATS_TOKEN } from '../../di/tokens';
import type { BuildParams } from './build';
import { benchmarkBuild } from './build';
import type { StartParams } from './start';
import { benchmarkStart } from './start';
import type { RunStats } from './types';

export interface Params {
  command: string;
  commandOptions: any;
  times?: number;
}

export type Result = RunStats;

export type BenchmarkCommand = (
  params: StartParams | BuildParams,
  providers?: Provider[]
) => Promise<Result>;

export default createCommand({
  name: 'benchmark',
  command: (di): Promise<Result> => {
    const { command } = di.get(COMMAND_PARAMETERS_TOKEN) as Params;

    switch (command) {
      case 'start':
        return benchmarkStart(di);
      case 'build':
        return benchmarkBuild(di);
    }
  },
  providers: [
    {
      provide: WITH_BUILD_STATS_TOKEN,
      useValue: true,
    },
  ],
});
