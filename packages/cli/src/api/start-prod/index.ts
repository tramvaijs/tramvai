import type { Server } from 'http';
import type { PromiseType } from 'utility-types';
import type { ChildProcess } from 'child_process';
import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';
import type { WithConfig } from '../shared/types/withConfig';
import { CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../../di/tokens';
import type { Builder } from '../../typings/build/Builder';
import { startProdApplication } from './application';
import { startProdChildApp } from './child-app';

export type Params = WithConfig<{
  buildType?: 'server' | 'client' | 'all' | 'none';
  host?: string;
  port?: number;
  staticPort?: number;
  staticHost?: string;
  debug?: boolean;
  verboseWebpack?: boolean;
  sourceMap?: boolean;
  resolveSymlinks?: boolean;
  showConfig?: boolean;
  env?: Record<string, string>;
  fileCache?: boolean;
}>;

export type Result<T extends string = any> = Promise<
  PromiseType<ReturnType<Builder<T>['build']>> & {
    close: () => Promise<void>;
    staticServer?: Server;
    serverProcess?: ChildProcess;
    builder: Builder<T>;
  }
>;

export type StartProdCommand = (params: Params, providers?: Provider[]) => Result;

export default createCommand({
  name: 'start-prod',
  command: async (di): Result => {
    const configEntry = di.get(CONFIG_ENTRY_TOKEN);
    const portManager = di.get(PORT_MANAGER_TOKEN);

    await portManager.computeAvailablePorts();

    switch (configEntry.type) {
      case 'application':
        return startProdApplication(di);
      case 'module':
      case 'child-app':
        return startProdChildApp(di);
    }
  },
});
