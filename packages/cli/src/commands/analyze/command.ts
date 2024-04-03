import { CLICommand } from '../../models/command';
import { checkApplication } from '../../validators/commands/checkBuild';
import { checkConfigExists } from '../../validators/commands/checkConfigExists';
import { checkPwaDependencies } from '../../validators/commands/checkPwaDependencies';
import { runMigrationsAndCheckVersions } from '../../validators/commands/runMigrationsAndCheckVersions';
import { checkSwcDependencies } from '../../validators/commands/checkSwcDependencies';

export type Params = {
  target: string;
  plugin?: 'bundle' | 'whybundled' | 'statoscope';
  showConfig?: boolean;
};

class AnalyzeCommand extends CLICommand<Params> {
  name = 'analyze';

  description = 'Command for analyzing application';

  command = 'analyze <target>';

  options = [
    {
      name: '-p, --plugin',
      value: '[plugin]',
      description: 'Analysis plugin type <bundle|whybundled|statoscope>',
      defaultValue: 'bundle',
    },
    {
      name: '--showConfig',
      value: '[showConfig]',
      description: 'Show config with which cli was launched',
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

  alias = 'a';

  validators = [
    checkConfigExists,
    checkApplication,
    runMigrationsAndCheckVersions,
    checkPwaDependencies,
    checkSwcDependencies,
  ];

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./analyze').default(this.context, parameters);
  }
}

export default AnalyzeCommand;
