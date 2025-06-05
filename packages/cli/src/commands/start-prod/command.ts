import { CLICommand } from '../../models/command';

export interface Params {
  target: string;
  buildType: 'server' | 'client' | 'all' | 'none';
  host?: string;
  port?: number;
  staticPort?: number;
  staticHost?: string;
  debug?: boolean;
  sourceMap?: boolean;
  resolveSymlinks?: boolean;
  showConfig?: boolean;
}

export class StartProdCommand extends CLICommand<Params> {
  name = 'start-prod';

  description = 'Command to run in production mode';

  command = 'start-prod <target>';

  options = [
    {
      name: '-t, --buildType',
      value: '[type]',
      description: 'Build type <client|server|all|none>',
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
      name: '--verboseWebpack',
      value: '[verboseWebpack]',
      description: 'verbose output for webpack',
    },
    {
      name: '--sm, --sourceMap',
      value: '[sourceMap]',
      description: 'enable source map generation',
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

  alias = 'sp';

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
    return require('./startProd').startProd(this.context, parameters);
  }
}
