import type { Server } from 'http';
import type { PromiseType } from 'utility-types';
import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import type { WithConfig } from '../shared/types/withConfig';
import { COMMAND_PARAMETERS_TOKEN, CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../../di/tokens';
import type { Builder } from '../../typings/build/Builder';

export type Params = WithConfig<{
  buildType?: 'server' | 'client' | 'all';
  https?: boolean;
  httpsKey?: string;
  httpsCert?: string;
  host?: string;
  port?: number;
  staticPort?: number;
  staticHost?: string;
  debug?: boolean;
  trace?: boolean;
  verboseWebpack?: boolean;
  profile?: boolean;
  sourceMap?: boolean;
  noServerRebuild?: boolean;
  noClientRebuild?: boolean;
  resolveSymlinks?: boolean;
  showConfig?: boolean;
  analyze?: false | 'bundle' | 'whybundled' | 'statoscope' | 'rsdoctor' | 'stats';
  benchmark?: boolean;
  withBuildStats?: boolean;
  // @todo: not working?
  env?: Record<string, string>;
  onlyBundles?: string[];
  strictErrorHandle?: boolean;
  fileCache?: boolean;
  experimentalWebpackWorkerThreads?: boolean;
}>;

export type Result<T extends string = any> = Promise<
  PromiseType<ReturnType<Builder<T>['start']>> & {
    close: () => Promise<void>;
    staticServer?: Server;
    server?: Server;
    builder: Builder<T>;
  }
>;

export type StartCommand = (params: Params, providers?: Provider[]) => Result;

export default createCommand({
  name: 'start',
  command: async (di): Result => {
    const options = di.get(COMMAND_PARAMETERS_TOKEN as Params);
    const configEntry = di.get(CONFIG_ENTRY_TOKEN);
    const portManager = di.get(PORT_MANAGER_TOKEN);

    if (options.experimentalWebpackWorkerThreads) {
      if (configEntry.type !== 'application') {
        throw new Error(
          '--experimentalWebpackWorkerThreads option is only available for application project'
        );
      }

      const { startApplicationExperimental } = require('./application.experimental');
      return startApplicationExperimental(di);
    }

    await portManager.computeAvailablePorts();

    switch (configEntry.type) {
      case 'application':
        // eslint-disable-next-line no-case-declarations
        const { startApplication } = require('./application');
        return startApplication(di);
      case 'module':
        // eslint-disable-next-line no-case-declarations
        const { startModule } = require('./module');
        return startModule(di);
      case 'child-app':
        // eslint-disable-next-line no-case-declarations
        const { startChildApp } = require('./child-app');
        return startChildApp(di);
    }
  },
});
