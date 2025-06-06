import { CLICommand } from '../../models/command';

export type Params = {
  target: string;
  showConfig?: boolean;
  serve?: boolean;
  buildType: 'all' | 'none';
  onlyPages?: string[];
  header?: string[];
  folder?: string;
};

export class StaticCommand extends CLICommand<Params> {
  name = 'static';

  description = 'Command to export application routes to HTML pages';

  command = 'static <target>';

  options = [
    {
      name: '--showConfig',
      value: '[showConfig]',
      description: 'Show config with which cli was launched',
    },
    {
      name: '--serve',
      value: '[serve]',
      description: 'Run server to preview exported pages',
    },
    {
      name: '-t, --buildType',
      value: '[type]',
      description: 'Build type <all|none>',
      defaultValue: 'all',
    },
    {
      name: '--onlyPages',
      value: '[onlyPages]',
      transformer: (value: string) => value.split(','),
      description: 'Specify the comma separated paths list for static HTML generation',
    },
    {
      name: '--header',
      value: '[header...]',
      description: 'Add extra headers, which will be added to request for application pages',
    },
    {
      name: '--folder',
      value: '[folder]',
      description: 'Subfolder, when generated pages will be placed',
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

  alias = 'st';

  validators() {
    return [
      require('../../validators/commands/checkBuild').checkApplication,
      require('../../validators/commands/runMigrationsAndCheckVersions')
        .runMigrationsAndCheckVersions,
    ];
  }

  action(parameters: Params) {
    // used require for lazy code execution
    return require('./static').default(this.context, parameters);
  }
}
