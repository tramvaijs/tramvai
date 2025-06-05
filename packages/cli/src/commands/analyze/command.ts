import { CLICommand } from '../../models/command';

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
      description: 'Analysis plugin type <bundle|whybundled|statoscope|rsdoctor>',
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

  validators() {
    return [
      require('../../validators/commands/checkConfigExists').checkConfigExists,
      require('../../validators/commands/checkBuild').checkApplication,
      require('../../validators/commands/runMigrationsAndCheckVersions')
        .runMigrationsAndCheckVersions,
      require('../../validators/commands/checkPwaDependencies').checkPwaDependencies,
      require('../../validators/commands/checkSwcDependencies').checkSwcDependencies,
      require('../../validators/commands/checkReactCompilerDependencies')
        .checkReactCompilerDependencies,
    ];
  }

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./analyze').default(this.context, parameters);
  }
}

export default AnalyzeCommand;
