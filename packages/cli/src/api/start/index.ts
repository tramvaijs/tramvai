import type { Server } from 'http';
import type { PromiseType } from 'utility-types';
import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import type { WithConfig } from '../shared/types/withConfig';
import { startApplication } from './application';
import { startModule } from './module';
import { CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../../di/tokens';
import { startChildApp } from './child-app';
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
  modern?: boolean;
  sourceMap?: boolean;
  noServerRebuild?: boolean;
  noClientRebuild?: boolean;
  resolveSymlinks?: boolean;
  showConfig?: boolean;
  withBuildStats?: boolean;
  // @todo: not working?
  env?: Record<string, string>;
  onlyBundles?: string[];
  strictErrorHandle?: boolean;
  fileCache?: boolean;
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
        return startApplication(di);
      case 'module':
        return startModule(di);
      case 'child-app':
        return startChildApp(di);
    }
  },
});
