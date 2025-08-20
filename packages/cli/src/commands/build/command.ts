import { CLICommand } from '../../models/command';
import { checkApplication } from '../../validators/commands/checkBuild';
import { checkConfigExists } from '../../validators/commands/checkConfigExists';
import { checkDependencies } from '../../validators/commands/checkDependencies';
import { runMigrationsAndCheckVersions } from '../../validators/commands/runMigrationsAndCheckVersions';
import type { BuildCommand as BuildCommandType } from '../../api/build';
import { checkPwaDependencies } from '../../validators/commands/checkPwaDependencies';
import { checkSwcDependencies } from '../../validators/commands/checkSwcDependencies';
import { checkReactCompilerDependencies } from '../../validators/commands/checkReactCompilerDependencies';
import { getFeaturesProperties, getProjectProperties } from '../../models/analytics/utils';

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

  validators = [
    checkConfigExists,
    checkApplication,
    runMigrationsAndCheckVersions,
    checkDependencies,
    checkPwaDependencies,
    checkSwcDependencies,
    checkReactCompilerDependencies,
  ];

  async action(parameters: Params) {
    const start = Date.now();

    await this.context.analytics.send({
      event: 'cli:command:start',
      message: '@tramvai/cli production build started',
      level: 'INFO',
      command: 'build',
      parameters,
      project: getProjectProperties({ parameters, configManager: this.context.config }),
      features: getFeaturesProperties({ parameters, configManager: this.context.config }),
    });

    // used require for lazy code execution
    return require('./build')
      .default(this.context, parameters)
      .then(async (result) => {
        await this.context.analytics.send({
          event: 'cli:command:end',
          message: '@tramvai/cli production build finished',
          level: 'INFO',
          command: 'build',
          parameters,
          duration: Date.now() - start,
          project: getProjectProperties({ parameters, configManager: this.context.config }),
          memoryUsage: this.context.analytics.memoryMonitor.read(),
        });

        return result;
      })
      .catch(async (error) => {
        await this.context.analytics.send({
          event: 'cli:command:error',
          message: '@tramvai/cli production build failed',
          level: 'ERROR',
          command: 'build',
          parameters,
          duration: Date.now() - start,
          error,
          project: getProjectProperties({ parameters, configManager: this.context.config }),
          memoryUsage: this.context.analytics.memoryMonitor.read(),
        });

        throw error;
      });
  }
}

export default BuildCommand;
