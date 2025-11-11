import { CLICommand } from '../../models/command';
import type { Params as StartParams } from '../start/command';

export type Params = StartParams & {
  times?: number;
};

export class BenchmarkCommand extends CLICommand<Params> {
  name = 'benchmark';

  description = 'Command to run benchmark of the @tramvai/cli';

  command = 'benchmark <command> <target>';

  options = [
    {
      name: '--rs, --resolveSymlinks',
      value: '[resolveSymlinks]',
      transformer: (value: string) => value !== 'false',
      description:
        'Pass value to `resolve.symlinks` in webpack (https://webpack.js.org/configuration/resolve/#resolve-symlinks)`',
    },
    {
      name: '--showConfig',
      value: '[showConfig]',
      description: 'Show config with which cli was launched',
    },
    {
      name: '--onlyBundles',
      value: '[onlyBundles]',
      transformer: (value: string) => value.split(','),
      description:
        'Specify the names of the bundles that need to be collected, other bundles will not be collected and their request will fail with an error',
    },
    {
      name: '--fileCache',
      value: '[fileCache]',
      transformer: (value: string) => value !== 'false',
      description: 'Enable/disable persistent file cache for used cli builder',
    },
    {
      name: '-t, --buildType',
      value: '[type]',
      description: 'Build type <client|server>',
      defaultValue: 'client',
    },
    {
      name: '--times',
      value: '[times]',
      description: 'How many times to run single type of benchmark',
    },
    {
      name: '--experimentalWebpackWorkerThreads',
      value: '[experimentalWebpackWorkerThreads]',
      transformer: (value: string) => value !== 'false',
      description:
        'Enable new experimental @tramvai/api builder to run webpack compilation in worker threads',
    },
  ];

  alias = 'bench';

  validators() {
    return [
      require('../../validators/commands/checkConfigExists').checkConfigExists,
      require('../../validators/commands/checkBuild').checkApplication,
      require('../../validators/commands/runMigrationsAndCheckVersions')
        .runMigrationsAndCheckVersions,
      require('../../validators/commands/checkDependencies').checkDependencies,
    ];
  }

  action(parameters) {
    // used require for lazy code execution
    return require('./benchmark').default(this.context, parameters);
  }
}
