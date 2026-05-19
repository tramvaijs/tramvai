import type { Server } from 'http';
import type { PromiseType } from 'utility-types';
import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import type { WithConfig } from '../shared/types/withConfig';
import { CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../../di/tokens';
import type { Builder } from '../../typings/build/Builder';
import { ConvertToSchema } from '../../schema/ConfigSchema';
import { ApplicationConfigEntry } from '../../typings/configEntry/application';

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
  config?: ConvertToSchema<ApplicationConfigEntry>;
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
    const configEntry = di.get(CONFIG_ENTRY_TOKEN);
    const portManager = di.get(PORT_MANAGER_TOKEN);

    await portManager.computeAvailablePorts();

    switch (configEntry.type) {
      case 'application':
        // eslint-disable-next-line no-case-declarations
        const { startApplication } = require('./application.experimental');
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
