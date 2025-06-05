import { CLICommand } from '../../models/command';
import type { BuildCommand as BuildCommandType } from '../../api/build';

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
      name: '--verboseWebpack',
      value: '[verboseWebpack]',
      description: 'verbose output for webpack',
    },
  ];

  alias = 'b';

  validators() {
    return [
      require('../../validators/commands/checkConfigExists').checkConfigExists,
      require('../../validators/commands/checkBuild').checkApplication,
      require('../../validators/commands/runMigrationsAndCheckVersions')
        .runMigrationsAndCheckVersions,
      require('../../validators/commands/checkDependencies').checkDependencies,
      require('../../validators/commands/checkPwaDependencies').checkPwaDependencies,
      require('../../validators/commands/checkSwcDependencies').checkSwcDependencies,
      require('../../validators/commands/checkReactCompilerDependencies')
        .checkReactCompilerDependencies,
    ];
  }

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./build').default(this.context, parameters);
  }
}

export default BuildCommand;
