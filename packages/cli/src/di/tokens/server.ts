import { createToken } from '@tinkoff/dippy';
import type { StoppableServer } from 'stoppable';

export const SERVER_TOKEN = createToken<StoppableServer>('server server');

export const STATIC_SERVER_TOKEN = createToken<StoppableServer>('server staticServer');

export const SELF_SIGNED_CERTIFICATE_TOKEN = createToken<{
  keyPath: string;
  certificatePath: string;
}>('self signed certificates token');
