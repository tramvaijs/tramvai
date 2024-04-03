import { CLICommand } from '../../models/command';
import { checkApplication } from '../../validators/commands/checkBuild';
import { checkConfigExists } from '../../validators/commands/checkConfigExists';
import { checkDependencies } from '../../validators/commands/checkDependencies';
import { runMigrationsAndCheckVersions } from '../../validators/commands/runMigrationsAndCheckVersions';
import type { StartCommand as StartCommandType } from '../../api/start';
import { checkPwaDependencies } from '../../validators/commands/checkPwaDependencies';
import { checkSwcDependencies } from '../../validators/commands/checkSwcDependencies';

export type Params = Parameters<StartCommandType>[0] & {
  target: string;
};

export class StartCommand extends CLICommand<Params> {
  name = 'start';

  description = 'Command to run in development mode';

  command = 'start <target>';

  options = [
    {
      name: '-p, --port',
      value: '[port]',
      description: 'port to run server',
    },
    {
      name: '-h, --host',
      value: '[host]',
      description: 'host to run server',
    },
    {
      name: '--sp, --staticPort',
      value: '[staticPort]',
      description: 'port to run static',
    },
    {
      name: '--sh, --staticHost',
      value: '[staticHost]',
      description: 'host to run static',
    },
    {
      name: '-d, --debug',
      value: '[debug]',
      description: 'start in debug mode (enable source map, server starting with --inspect)',
    },
    {
      name: '--trace',
      value: '[trace]',
      description:
        'start in trace mode (allow trace for warnings, server starts with --trace-deprecation)',
    },
    {
      name: '--verboseWebpack',
      value: '[verboseWebpack]',
      description: 'verbose output for webpack',
    },
    {
      name: '--profile',
      value: '[profile]',
      description: 'report statistic how much time execute loaders and plugins',
    },
    {
      name: '--modern',
      value: '[modern]',
      description: 'modern compilation code with es2015+',
    },
    {
      name: '--sm, --sourceMap',
      value: '[sourceMap]',
      description: 'enable source map generation',
    },
    {
      name: '-n, --noServerRebuild',
      value: '[noServerRebuild]',
      description: 'disable server rebuild on changes',
    },
    {
      name: '-l, --noClientRebuild',
      value: '[noClientRebuild]',
      description: 'disable client rebuild on changes',
    },
    {
      name: '-t, --buildType',
      value: '[type]',
      description: 'Тип сборки <client|server|all>',
      defaultValue: 'all',
    },
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
      name: '--https',
      value: '[https]',
      transformer: (value: string) => value !== 'false',
      description: 'Enable/disable https protocol for application',
    },
    {
      name: '--httpsKey',
      value: '[httpsKey]',
      description: 'Path to https key certificate',
    },
    {
      name: '--httpsCert',
      value: '[httpsCert]',
      description: 'Path to https certificate',
    },
  ];

  alias = 's';

  validators = [
    checkConfigExists,
    checkApplication,
    runMigrationsAndCheckVersions,
    checkDependencies,
    checkPwaDependencies,
    checkSwcDependencies,
  ];

  action(parameters) {
    // used require for lazy code execution
    return require('./start').default(this.context, parameters);
  }
}
