import { provide } from '@tinkoff/dippy';
import type { Provider } from '@tinkoff/dippy';

import { COMMAND_PARAMETERS_TOKEN, CONFIG_ENTRY_TOKEN, PORT_MANAGER_TOKEN } from '../tokens';
import { PortManager } from '../../models/port-manager';
import { Logger } from '../../models/logger';

export const networkProviders: readonly Provider[] = [
  provide({
    provide: PORT_MANAGER_TOKEN,
    useClass: PortManager,
    deps: {
      configEntry: CONFIG_ENTRY_TOKEN,
      commandParams: COMMAND_PARAMETERS_TOKEN,
      logger: 'network logger',
    },
  }),
  provide({
    provide: 'network logger',
    useClass: Logger,
  }),
] as const;
