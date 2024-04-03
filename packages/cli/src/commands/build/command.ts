import { CLICommand } from '../../models/command';
import { checkApplication } from '../../validators/commands/checkBuild';
import { checkConfigExists } from '../../validators/commands/checkConfigExists';
import { checkDependencies } from '../../validators/commands/checkDependencies';
import { runMigrationsAndCheckVersions } from '../../validators/commands/runMigrationsAndCheckVersions';
import type { BuildCommand as BuildCommandType } from '../../api/build';
import { checkPwaDependencies } from '../../validators/commands/checkPwaDependencies';
import { checkSwcDependencies } from '../../validators/commands/checkSwcDependencies';

export type Params = Parameters<BuildCommandType>[0] & {
  target: string;
};

class BuildCommand extends CLICommand<Params> {
  name = 'build';

  description = 'Command to build platform entities - applications, modules, libraries';

  command = 'build <target>';

  options = [
    {
      name: '-t, --buildType',
      value: '[type]',
      description: 'Build type <client|server|all>',
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
      name: '--disableProdOptimization',
      value: '[disableProdOptimization]',
      description: 'Disable optimization of bundle sizes for production (minification, etc.)',
    },
    {
      name: '--showConfig',
      value: '[showConfig]',
      description: 'Show config with which cli was launched',
    },
    {
      name: '--watchMode',
      value: '[watchMode]',
      description: '<package> Build library in watch mode',
    },
    {
      name: '--forPublish',
      value: '[forPublish]',
      description: '<package> Prepare library package.json for publication',
    },
    {
      name: '--fileCache',
      value: '[fileCache]',
      transformer: (value: string) => value !== 'false',
      description: 'Enable/disable persistent file cache for used cli builder',
    },
    {
      name: '--modern',
      value: '[modern]',
      description: 'modern compilation code with es2015+',
    },
    {
      name: '--onlyModern',
      value: '[onlyModern]',
      transformer: (value: string) => value !== 'false',
      description: 'Emit only modern build from client compilation',
    },
    {
      name: '--verboseWebpack',
      value: '[verboseWebpack]',
      description: 'verbose output for webpack',
    },
  ];

  alias = 'b';

  validators = [
    checkConfigExists,
    checkApplication,
    runMigrationsAndCheckVersions,
    checkDependencies,
    checkPwaDependencies,
    checkSwcDependencies,
  ];

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./build').default(this.context, parameters);
  }
}

export default BuildCommand;
