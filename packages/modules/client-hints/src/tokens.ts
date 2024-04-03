import { createToken } from '@tinkoff/dippy';
import type { UserAgent } from '@tinkoff/user-agent';
import type { DisplayMode } from './types';

export const USER_AGENT_TOKEN = createToken<UserAgent>('userAgent');

export const PARSER_CLIENT_HINTS_ENABLED = createToken<boolean>(
  'client-hints parserClientHints enabled'
);
