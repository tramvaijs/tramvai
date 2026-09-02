import type { Server } from 'http';
import type { PromiseType } from 'utility-types';
import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import type { WithConfig } from '../shared/types/withConfig';
import { COMMAND_PARAMETERS_TOKEN, CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../../di/tokens';
import type { Builder } from '../../typings/build/Builder';
import { ConvertToSchema } from '../../schema/ConfigSchema';
import { ApplicationConfigEntry } from '../../typings/configEntry/application';
import { ChildAppConfigEntry } from '../../typings/configEntry/child-app';

export type Params = WithConfig<{
  buildType?: 'server' | 'client' | 'all';
  https?: boolean;
  httpsKey?: string;
  httpsCert?: string;
  host?: string;
  port?: number;
  staticPort?: number;
  staticHost?: string;
  showProgress?: boolean;
  showBanner?: boolean;
  debug?: boolean;
  // for manual call in tests
  config?: ConvertToSchema<ApplicationConfigEntry | ChildAppConfigEntry>;
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
  env?: Record<string, string | null>;
  onlyBundles?: string[];
  strictErrorHandle?: boolean;
  fileCache?: boolean;
  disableServerRunnerWaiting?: boolean;
  noRebuild?: boolean;
  experimentalRspack?: boolean;
  experimentalWebpackWorkerThreads?: boolean;
  serverHot?: boolean;
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

    await portManager.computeAvailablePorts();

    switch (configEntry.type) {
      case 'application':
        if (options.experimentalWebpackWorkerThreads) {
          const { startWebpackApplication } = require('./application.experimental');
          return startWebpackApplication(di);
        }

        if (options.experimentalRspack) {
          const { startRspackApplication } = require('./application.experimental');
          return startRspackApplication(di);
        }

        // eslint-disable-next-line no-case-declarations
        const { startApplication } = require('./application');

        return startApplication(di);
      case 'module':
        // eslint-disable-next-line no-case-declarations
        const { startModule } = require('./module');
        return startModule(di);
      case 'child-app':
        if (options.experimentalWebpackWorkerThreads) {
          const { startWebpackChildApp } = require('./child-app.experimental');
          return startWebpackChildApp(di);
        }

        if (options.experimentalRspack) {
          const { startRspackChildApp } = require('./child-app.experimental');
          return startRspackChildApp(di);
        }

        // eslint-disable-next-line no-case-declarations
        const { startChildApp } = require('./child-app');

        return startChildApp(di);
    }
  },
});
