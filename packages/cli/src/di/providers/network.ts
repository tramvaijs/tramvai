import { provide } from '@tinkoff/dippy';
import type { Provider } from '@tinkoff/dippy';

import { COMMAND_PARAMETERS_TOKEN, CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../tokens';
import { PortManager } from '../../models/port-manager';
import { Logger } from '../../models/logger';

export const networkProviders: readonly Provider[] = [
  provide({
    deps: {
      configEntry: CONFIG_ENTRY_TOKEN,
      commandParams: COMMAND_PARAMETERS_TOKEN,
      logger: 'network logger',
    },
    provide: PORT_MANAGER_TOKEN,
    useFactory: (deps) => {
      // @ts-expect-error
      const portManager = new PortManager(deps);

      ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, async () => {
          await portManager.cleanup();

          process.exit();
        });
      });

      return portManager;
    },
  }),
  provide({
    provide: 'network logger',
    useClass: Logger,
  }),
] as const;
