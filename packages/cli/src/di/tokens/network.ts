import { createToken } from '@tinkoff/dippy';

import type { PortManager } from '../../models/port-manager';

export const PORT_MANAGER_TOKEN = createToken<PortManager>('portManager');
